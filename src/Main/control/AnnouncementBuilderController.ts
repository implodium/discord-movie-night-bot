import {inject, injectable} from "inversify";
import MovieNight from "../util/announcements/MovieNight";
import MovieNightFinalDecision from "../util/announcements/MovieNightFinalDecision";
import MovieNightStart from "../util/announcements/MovieNightStart";
import Logger from "../logger/Logger";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import {Message, MessageEmbed} from "discord.js";
import DateUtil from "../util/DateUtil";
import MovieNightBuilder from "../announcemen_builder/MovieNightBuilder";
import MovieNightFinalDecisionBuilder from "../announcemen_builder/MovieNightFinalDecisionBuilder";
import MovieNightStartBuilder from "../announcemen_builder/MovieNightStartBuilder";
import GuildConfiguration from "../config/GuildConfiguration";

@injectable()
export default class AnnouncementBuilderController {

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(DateUtil) private dateUtil: DateUtil,
        @inject(MovieNightBuilder) private movieNightBuilder: MovieNightBuilder,
        @inject(MovieNightFinalDecisionBuilder) private movieNightFinalDecisionBuilder: MovieNightFinalDecisionBuilder,
        @inject(MovieNightStartBuilder) private movieNightStartBuilder: MovieNightStartBuilder
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
        return this.movieNightFinalDecisionBuilder.build(
            announcement,
            announcementConfiguration,
            new Date()
        )
    }

    buildMovieNightStart(
        announcement: MovieNightStart,
        announcementConfiguration: AnnouncementConfiguration,
        guildConfig: GuildConfiguration
    ): Promise<MessageEmbed> {
        return this.movieNightStartBuilder.buildWithInfo(
            announcement,
            announcementConfiguration,
            guildConfig
        )
    }

}
