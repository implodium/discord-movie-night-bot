import {inject, injectable} from "inversify";
import MovieNightStart from "../util/announcements/MovieNightStart";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import {MessageEmbed, VoiceChannel} from "discord.js";
import InternalError from "../error/InternalError";
import DiscordController from "../control/DiscordController";
import GuildConfiguration from "../config/GuildConfiguration";

@injectable()
export default class MovieNightStartBuilder {

    constructor(
        @inject(DiscordController) private discordController: DiscordController
    ) {
    }

    async buildWithInfo(
        announcement: MovieNightStart,
        announcementConfig: AnnouncementConfiguration,
        guildConfig: GuildConfiguration
    ): Promise<MessageEmbed> {
        const title = MovieNightStartBuilder.getTitle(announcement)
        const cinemaChannel = await this.getCinemaChannel(guildConfig)
        const description = await MovieNightStartBuilder.getDescription(announcement, cinemaChannel)

        return new MessageEmbed()
            .setColor('RED')
            .setTitle(title)
            .setDescription(description)
    }

    private static getTitle(announcement: MovieNightStart) {
        if (announcement.titleDefault) {
            return announcement.titleDefault
        } else {
            throw new InternalError("default title is missing for " +
                "movie night start announcement")
        }
    }

    private async getCinemaChannel(guildConfig: GuildConfiguration): Promise<VoiceChannel> {
        if (guildConfig.id && guildConfig.cinemaChannelId) {
            const channel = await this.discordController.getChannelOf(
                guildConfig.id, guildConfig.cinemaChannelId
            )

            if (channel.isVoice()) {
                return channel as VoiceChannel
            } else {
                throw new InternalError("the cinema channel is required to be a voice channel")
            }
        } else {
            throw new InternalError("cinema id not set")
        }
    }

    private static async getDescription(announcement: MovieNightStart, cinemaChannel: VoiceChannel): Promise<string> {
        if (announcement.descriptionDefault) {
            return announcement.descriptionDefault.replace("$cinemaChannel", cinemaChannel.name)
        } else {
            throw new InternalError("no default description set in the conifg")
        }
    }
}
