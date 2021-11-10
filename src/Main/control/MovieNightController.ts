import {inject, injectable} from "inversify";
import Logger from "../logger/Logger";
import ConfigController from "./ConfigController";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import GuildConfiguration from "../config/GuildConfiguration";
import ScheduleController from "./ScheduleController";
import {Subject} from "rxjs";
import ScheduledMovieNight from "../util/ScheduledMovieNight";
import InternalError from "../error/InternalError";
import StorageController from "./StorageController";

@injectable()
export default class MovieNightController {

    schedulesMovieNights: Map<string, ScheduledMovieNight[]> = new Map<string, ScheduledMovieNight[]>()

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(ConfigController) private configController: ConfigController,
        @inject(ScheduleController) private scheduleController: ScheduleController,
        @inject(StorageController) private storageController: StorageController
    ) {
    }

    async initGuild(guildConfig: GuildConfiguration) {
        if (guildConfig.id) {
            this.schedulesMovieNights.set(guildConfig.id, [])
            const storage = await this.storageController.get()
            const guildStorages = await storage.guildStorages

            if (guildStorages) {
                const guildStorage = guildStorages[guildConfig.id]
                if (guildStorage && guildStorage.scheduledMovieNights) {
                    for (const movieNight of guildStorage.scheduledMovieNights) {
                        this.logger.debug(typeof movieNight.date)
                        await this.scheduleMovieNight(new Date(movieNight.date), guildConfig)
                    }
                }
            } else {
                throw new InternalError('guild storage not set')
            }
        } else {
            throw new InternalError("id was not set in configuration")
        }
    }

    async scheduleMovieNight(date: Date, guildConfig: GuildConfiguration) {
        const movieNightEvent = new Subject<void>()
        this.logger.info('scheduling new movie night on ' + date.toLocaleString())
        const announcementConfig: AnnouncementConfiguration = await this
            .configController
            .getAnnouncementConfigByGuildConfig(guildConfig)

        let announcementTime = 3
        if (announcementConfig.announcementTime) {
            announcementTime = announcementConfig.announcementTime
        }

        const movieNightAnnouncementDate = new Date(date)
        movieNightAnnouncementDate.setDate(date.getDate() - announcementTime)

        const movieNightFinalDecisionAnnouncementDate = new Date(date)
        movieNightFinalDecisionAnnouncementDate.setDate(date.getDate() - 1)

        const movieNightJob = this.scheduleController.scheduleMovieNightAnnouncement(
            movieNightAnnouncementDate,
            announcementConfig,
            guildConfig,
            date
        )

        const movieNightFinalDecisionJob = this.scheduleController.scheduleMovieNightFinalDecisionAnnouncements(
            movieNightFinalDecisionAnnouncementDate,
            announcementConfig,
            guildConfig
        )

        const movieNightStartJob = this.scheduleController.scheduleMovieNightStartAnnouncement(
            date,
            announcementConfig,
            guildConfig,
            movieNightEvent,
        )

        movieNightEvent.subscribe({
            complete: () => {
                if (guildConfig.id) {
                    this.cancelNextMovieNight(guildConfig.id)
                } else {
                    throw new InternalError('id was not set in configuration')
                }
            }
        })

        if (guildConfig.id) {
            const scheduledGuildMovies = this.schedulesMovieNights.get(guildConfig.id)
            if (scheduledGuildMovies) {
                scheduledGuildMovies.push({
                    date,
                    movieNightJob,
                    movieNightFinalDecisionJob,
                    movieNightStartJob,
                    event: movieNightEvent
                })
            }
        }
    }

    async storeMovieNight(date: Date, guildConfig: GuildConfiguration) {
        if (guildConfig.id) {
            await this.storageController.pushMovieNight({date}, guildConfig.id)
        }
    }

    async startMovieNight(date: Date, guildConfig: GuildConfiguration) {
        await Promise.all([
            await this.scheduleMovieNight(date, guildConfig),
            await this.storeMovieNight(date, guildConfig)
        ])
    }

    cancelNextMovieNight(guildId: string, deletes: number = 1) {
        const movieNights = this.sortMovieNights(guildId)
        let index = 0

        while (index <= deletes) {
            movieNights.pop()
            index++
        }
    }

    cancelMovieNightSchedules(scheduledMovieNight: ScheduledMovieNight) {
        scheduledMovieNight.movieNightJob.cancel()
        scheduledMovieNight.movieNightStartJob.cancel()
        scheduledMovieNight.movieNightFinalDecisionJob.cancel()
    }

    sortMovieNights(guildId: string) {
        const guildMovieNights = this.getGuildMovieNights(guildId)

        guildMovieNights.sort((s1, s2) => {
            return s1.date < s2.date ? 1 : -1
        })

        return guildMovieNights
    }

    getGuildMovieNights(guildId: string) {
        const guildMovieNights = this.schedulesMovieNights.get(guildId)

        if (guildMovieNights) {
            return guildMovieNights
        } else {
            throw new InternalError('guildMovieNight not initialized')
        }
    }

}
