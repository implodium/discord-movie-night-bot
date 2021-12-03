import {inject, injectable} from "inversify";
import ConfigController from "./ConfigController";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import GuildConfiguration from "../config/GuildConfiguration";
import Logger from "../logger/Logger";
import AnnouncementController from "./AnnouncementController";
import * as scheduler from "node-schedule";
import {Job} from "node-schedule";
import {Subject} from "rxjs";

@injectable()
export default class ScheduleController {

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(ConfigController) private configController: ConfigController,
        @inject(AnnouncementController) private announcementController: AnnouncementController,
    ) {
    }

    scheduleMovieNightAnnouncement(
        scheduleDate: Date,
        config : AnnouncementConfiguration,
        guildConfig: GuildConfiguration,
        dateOfMovieNight: Date
    ): any {
        return this.scheduleJob('movieNight', scheduleDate, async() => {
            if (config.announcementMessages
                && config.announcementMessages.movieNight
                && guildConfig.id
            ) {
                await this.announcementController.sendMovieNight(
                    config.announcementMessages.movieNight,
                    config,
                    dateOfMovieNight,
                    guildConfig
                )
            }
        })
    }

    scheduleMovieNightFinalDecisionAnnouncements(
        scheduleDate: Date,
        config: AnnouncementConfiguration,
        guildConfig: GuildConfiguration
    ): Job {
        return this.scheduleJob('movieNightFinalDecision',scheduleDate, async () => {
            if (config.announcementMessages
                && config.announcementMessages.movieNightFinalDecision
                && guildConfig.id
            ) {
                await this.announcementController.sendMovieNightFinalDecision(
                    config,
                    config.announcementMessages.movieNightFinalDecision,
                    guildConfig
                )
            }
        })
    }

    scheduleMovieNightStartAnnouncement(
        scheduleDate: Date,
        config: AnnouncementConfiguration,
        guildConfig: GuildConfiguration,
        movieNightEvent: Subject<void>
    ): Job {
        return this.scheduleJob('movieNightStart', scheduleDate, async () => {
            if (config.announcementMessages
                && config.announcementMessages.movieNightStart
                && guildConfig.id
            ) {
                await this.announcementController.sendMovieNightStart(
                    config.announcementMessages.movieNightStart,
                    config,
                    guildConfig,
                )

                movieNightEvent.complete()
            }
        })
    }

    scheduleJob(jobName: string, date: Date, callBack: () => void): Job {
        scheduler.scheduleJob(jobName, date, callBack)
        return scheduler.scheduledJobs[jobName]
    }
}
