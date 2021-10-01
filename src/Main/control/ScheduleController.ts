import {inject, injectable} from "inversify";
import ConfigController from "./ConfigController";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import GuildConfiguration from "../config/GuildConfiguration";
import Logger from "../logger/Logger";
import AnnouncementController from "./AnnouncementController";
import * as scheduler from "node-schedule";

@injectable()
export default class ScheduleController {

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(ConfigController) private configController: ConfigController,
        @inject(AnnouncementController) private announcementController: AnnouncementController,
    ) {
    }

    async scheduleMovieNightAnnouncement(
        scheduleDate: Date,
        config : AnnouncementConfiguration,
        guildConfig: GuildConfiguration,
        dateOfMovieNight: Date
    ) {
        scheduler.scheduleJob(scheduleDate, async () => {
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

    async scheduleMovieNightFinalDecisionAnnouncements(
        scheduleDate: Date,
        config: AnnouncementConfiguration,
        guildConfig: GuildConfiguration
    ) {
        scheduler.scheduleJob(scheduleDate, async () => {
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

    async scheduleMovieNightStartAnnouncement(
        scheduleDate: Date,
        config: AnnouncementConfiguration,
        guildConfig: GuildConfiguration
    ) {
        scheduler.scheduleJob(scheduleDate, async () => {
            if (config.announcementMessages
                && config.announcementMessages.movieNightStart
                && guildConfig.id
            ) {
                await this.announcementController.sendMovieNightStart(
                    config.announcementMessages.movieNightStart,
                    config,
                    guildConfig,
                )
            }
        })
    }
}
