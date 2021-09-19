import {inject, injectable} from "inversify";
import MovieNightReminderAnnouncements from "../util/announcements/MovieNightReminderAnnouncements";
import Announcement from "../util/announcements/Announcement";
import FinalMovieDecisionAnnouncement from "../util/announcements/FinalMovieDecisionAnnouncement";
import FinalMovieNightAnnouncement from "../util/announcements/FinalMovieNightAnnouncement";
import Logger from "../logger/Logger";

@injectable()
export default class AnnouncementBuilderController {

    constructor(
        @inject(Logger) private logger: Logger
    ) {
    }


    buildMovieReminderAnnouncement(announcement: MovieNightReminderAnnouncements): Promise<Announcement> {
        return new Promise((resolve, reject) => {
            this.logger.warn('not implemented yet')
        })
    }

    buildFinalMovieDecisionAnnouncement(announcement: FinalMovieDecisionAnnouncement): Promise<Announcement> {
        return new Promise((resolve, reject) => {
            this.logger.warn('not implemented yet')
        })
    }

    buildFinalMovieNightAnnounvement(announcement: FinalMovieNightAnnouncement): Promise<Announcement> {
        return new Promise((resolve, reject) => {
            this.logger.warn('not implemented yet')
        })
    }
}
