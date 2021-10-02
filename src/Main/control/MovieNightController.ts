import {inject, injectable} from "inversify";
import Logger from "../logger/Logger";
import ConfigController from "./ConfigController";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import GuildConfiguration from "../config/GuildConfiguration";
import ScheduleController from "./ScheduleController";
import ScheduledMovieNight from "../util/ScheduledMovieNight";
import GuildConfigurations from "../config/GuildConfigurations";

@injectable()
export default class MovieNightController {

    schedulesMovieNights: Map<string, ScheduledMovieNight[]> = new Map<string, ScheduledMovieNight[]>()

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(ConfigController) private configController: ConfigController,
        @inject(ScheduleController) private scheduleController: ScheduleController
    ) {
    }

    init() {
        const guildConfigs: GuildConfigurations = this.configController.getConfig('guilds')

        for (const [id] of Object.entries(guildConfigs)) {
            this.initGuild(id)
        }

        this.logger.info('initialized movie night controller')
    }

    initGuild(guildId: string) {
        this.schedulesMovieNights.set(guildId, [])
    }

    async startMovieNight(date: Date, guildConfig: GuildConfiguration) {
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
            guildConfig
        )

        if (guildConfig.id) {
            const scheduledGuildMovies = this.schedulesMovieNights.get(guildConfig.id)
            if (scheduledGuildMovies) {
                scheduledGuildMovies.push({
                    date,
                    movieNightJob,
                    movieNightFinalDecisionJob,
                    movieNightStartJob
                })
            }
        }
    }

}
