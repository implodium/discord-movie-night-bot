import {inject, injectable} from "inversify";
import Logger from "../logger/Logger";
import DiscordController from "./DiscordController";
import InternalError from "../error/InternalError";
import {TextChannel} from "discord.js";
import AnnouncementBuilderController from "./AnnouncementBuilderController";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import GuildConfiguration from "../config/GuildConfiguration";
import MovieNight from "../util/announcements/MovieNight";
import MovieNightFinalDecision from "../util/announcements/MovieNightFinalDecision";
import MovieNightStart from "../util/announcements/MovieNightStart";

@injectable()
export default class AnnouncementController {

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(DiscordController) private discordController: DiscordController,
        @inject(AnnouncementBuilderController) private announcementBuilderController: AnnouncementBuilderController
    ) {}

    async getOutChannel(config: GuildConfiguration): Promise<TextChannel> {
        if (config.id && config.announcementChannelId) {
            const channel = await this.discordController.getChannelOf(config.id, config.announcementChannelId)
            if (channel.isText()) {
                return channel as TextChannel
            } else {
                throw new InternalError(
                    "Announcement channel is required to be a TextChannel"
                )
            }
        } else {
            throw new InternalError(
                "guild id or announcement channel " +
                "is not defined in the config"
            )
        }
    }

    public async sendMovieNight(
        movieNight: MovieNight,
        config: AnnouncementConfiguration,
        dateOfMovieNight: Date,
        guildConfig: GuildConfiguration
    ) {
        const outChannel = await this.getOutChannel(guildConfig)
        const embed = await this.announcementBuilderController.buildMovieNight(
            movieNight,
            config,
            dateOfMovieNight
        )

        await outChannel.send({embeds: [embed]})
    }

    public async sendMovieNightStart(
        announcement: MovieNightStart,
        config: AnnouncementConfiguration,
        guildConfig: GuildConfiguration,
    ) {
        const outChannel = await this.getOutChannel(guildConfig)
        const embed = await this.announcementBuilderController.buildMovieNightStart(
            announcement,
            config,
            guildConfig
        )

        await outChannel.send({embeds: [embed]})
    }

    public async sendMovieNightFinalDecision(
        config: AnnouncementConfiguration,
        announcement: MovieNightFinalDecision,
        guildConfig: GuildConfiguration
    ) {
        const outChannel = await this.getOutChannel(guildConfig)
        const embed = await this.announcementBuilderController.buildMovieNightFinalDecision(
            announcement,
            config
        )

        await outChannel.send({embeds: [embed]})
    }
}
