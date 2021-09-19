import {inject, injectable} from "inversify";
import MovieNightReminderAnnouncements from "../util/announcements/MovieNightReminderAnnouncements";
import Announcement from "../util/announcements/Announcement";
import FinalMovieDecisionAnnouncement from "../util/announcements/FinalMovieDecisionAnnouncement";
import FinalMovieNightAnnouncement from "../util/announcements/FinalMovieNightAnnouncement";
import Logger from "../logger/Logger";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";

@injectable()
export default class AnnouncementBuilderController {

    constructor(
        @inject(Logger) private logger: Logger
    ) {
    }


    buildMovieReminderAnnouncement(
        announcement: MovieNightReminderAnnouncements,
        announcementConfig: AnnouncementConfiguration
    ): Promise<Announcement> {
        return new Promise((resolve, reject) => {
            this.logger.debug(announcement.descriptionDefault)
        })
    }

    buildFinalMovieDecisionAnnouncement(
        announcement: FinalMovieDecisionAnnouncement,
        announcementConfiguration: AnnouncementConfiguration
    ): Promise<Announcement> {
        return new Promise((resolve, reject) => {
            this.logger.warn('not implemented yet')
        })
    }

    buildFinalMovieNightAnnounvement(
        announcement: FinalMovieNightAnnouncement,
        announcementConfiguration: AnnouncementConfiguration
    ): Promise<Announcement> {
        return new Promise((resolve, reject) => {
            this.logger.warn('not implemented yet')
        })
    }
}
