import {inject, injectable} from "inversify";
import MovieNight from "../util/announcements/MovieNight";
import MovieNightFinalDecision from "../util/announcements/MovieNightFinalDecision";
import MovieNightStart from "../util/announcements/MovieNightStart";
import Logger from "../logger/Logger";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import {Message, MessageEmbed} from "discord.js";
import DateUtil from "../util/DateUtil";
import MovieNightBuilder from "../announcemen_builder/MovieNightBuilder";

@injectable()
export default class AnnouncementBuilderController {

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(DateUtil) private dateUtil: DateUtil,
        @inject(MovieNightBuilder) private movieNightBuilder: MovieNightBuilder
    ) {
    }


    buildMovieNight(
        announcement: MovieNight,
        announcementConfig: AnnouncementConfiguration,
        movieNightDate: Date
    ): Promise<MessageEmbed> {
        return this.movieNightBuilder.build(
            announcement,
            announcementConfig,
            movieNightDate
        )
    }

    reactMovieNight(
        message: Message,
        announcement: MovieNight
    ): Promise<void> {
        return this.movieNightBuilder.react(message, announcement)
    }

    buildMovieNightFinalDecision(
        announcement: MovieNightFinalDecision,
        announcementConfiguration: AnnouncementConfiguration
    ): Promise<MessageEmbed> {
        return new Promise((resolve, reject) => {
            this.logger.warn('not implemented yet')
        })
    }

    buildMovieNightStart(
        announcement: MovieNightStart,
        announcementConfiguration: AnnouncementConfiguration
    ): Promise<MessageEmbed> {
        return new Promise((resolve, reject) => {
            this.logger.warn('not implemented yet')
        })
    }

}
