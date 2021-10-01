import {inject, injectable} from "inversify";
import Logger from "../logger/Logger";
import ConfigController from "./ConfigController";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import GuildConfiguration from "../config/GuildConfiguration";
import ScheduleController from "./ScheduleController";

@injectable()
export default class MovieNightController {

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(ConfigController) private configController: ConfigController,
        @inject(ScheduleController) private scheduleController: ScheduleController
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

        await this.scheduleController.scheduleMovieNightAnnouncement(
            movieNightAnnouncementDate,
            announcementConfig,
            guildConfig,
            date
        )

        await this.scheduleController.scheduleMovieNightFinalDecisionAnnouncements(
            movieNightFinalDecisionAnnouncementDate,
            announcementConfig,
            guildConfig
        )

        await this.scheduleController.scheduleMovieNightStartAnnouncement(
            date,
            announcementConfig,
            guildConfig
        )

    }

}
