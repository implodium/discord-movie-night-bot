import {inject, injectable} from "inversify";
import MovieNight from "../util/announcements/MovieNight";
import Announcement from "../util/announcements/Announcement";
import MovieNightFinalDecision from "../util/announcements/MovieNightFinalDecision";
import MovieNightStart from "../util/announcements/MovieNightStart";
import Logger from "../logger/Logger";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";

@injectable()
export default class AnnouncementBuilderController {

    constructor(
        @inject(Logger) private logger: Logger
    ) {
    }


    buildMovieNight(
        announcement: MovieNight,
        announcementConfig: AnnouncementConfiguration
    ): Promise<Announcement> {
        return new Promise((resolve, reject) => {
            this.logger.debug(announcement.titleDefault)
        })
    }

    buildMovieNightFinalDecision(
        announcement: MovieNightFinalDecision,
        announcementConfiguration: AnnouncementConfiguration
    ): Promise<Announcement> {
        return new Promise((resolve, reject) => {
            this.logger.warn('not implemented yet')
        })
    }

    buildMovieNightStart(
        announcement: MovieNightStart,
        announcementConfiguration: AnnouncementConfiguration
    ): Promise<Announcement> {
        return new Promise((resolve, reject) => {
            this.logger.warn('not implemented yet')
        })
    }
}
