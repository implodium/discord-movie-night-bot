import {inject, injectable} from "inversify";
import Logger from "../logger/Logger";
import ConfigController from "./ConfigController";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import AnnouncementController from "./AnnouncementController";
import GuildConfiguration from "../config/GuildConfiguration";

@injectable()
export default class MovieNightController {

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(ConfigController) private configController: ConfigController,
        @inject(AnnouncementController) private announcementController: AnnouncementController
    ) {
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

        await this.announcementController.scheduleMovieNightAnnouncement(
            movieNightAnnouncementDate,
            announcementConfig,
            guildConfig,
            date
        )

        await this.announcementController.scheduleMovieNightFinalDecisionAnnouncements(
            movieNightFinalDecisionAnnouncementDate,
            announcementConfig,
            guildConfig
        )

        await this.announcementController.scheduleMovieNightStartAnnouncement(
            date,
            announcementConfig,
            guildConfig
        )

    }

}
