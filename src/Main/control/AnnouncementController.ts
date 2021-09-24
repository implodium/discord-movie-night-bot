import {inject, injectable} from "inversify";
import Logger from "../logger/Logger";
import ConfigController from "./ConfigController";
import GuildConfigurations from "../config/GuildConfigurations";
import DiscordController from "./DiscordController";
import InternalError from "../error/InternalError";
import {TextChannel} from "discord.js";
import AnnouncementBuilderController from "./AnnouncementBuilderController";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import GuildConfiguration from "../config/GuildConfiguration";
import MovieNight from "../util/announcements/MovieNight";

@injectable()
export default class AnnouncementController {

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(ConfigController) private configController: ConfigController,
        @inject(DiscordController) private discordController: DiscordController,
        @inject(AnnouncementBuilderController) private announcementBuilderController: AnnouncementBuilderController
    ) {}

    async init(): Promise<void> {
        const guildConfigs: GuildConfigurations = this.configController.getConfig('guilds')

        for (const [id, guildConfig] of Object.entries(guildConfigs)) {
            const announcementChannel = await this.getAnnouncementChannel(id, guildConfig)
            const announcementConfig = await this.configController.getAnnouncementConfigByGuildConfig(guildConfig)
            const dateOfNextMovieNight = await this.getDate(announcementConfig)

            await this.initScheduler(announcementConfig, announcementChannel, dateOfNextMovieNight)
        }
    }

    async initScheduler(config: AnnouncementConfiguration, outChannel: TextChannel, movieNightDate: Date) {
        if (
            config.announcementMessages
            && config.announcementMessages.movieNight
            && config.announcementMessages.movieNightFinalDecision
            && config.announcementMessages.movieNightStart
        ) {
            await this.scheduleMovieNight(
                config,
                config.announcementMessages.movieNight,
                outChannel,
                movieNightDate
            )
        }

    }

    async getAnnouncementChannel(guildId: string, guildConfig: GuildConfiguration) {
        if (guildConfig.announcementChannelId) {
            const channel = await this.discordController
                .getChannelOf(guildId, guildConfig.announcementChannelId)

            if (channel.isText()) {
                return channel as TextChannel
            } else {
                throw new InternalError(
                    `given announcement channel is not a text channel. Is: ${channel.type}`
                )
            }
        } else {
            throw new InternalError('announcement channel not defined for given guild')
        }
    }

    private getDate(config: AnnouncementConfiguration): Promise<Date> {
        return new Promise((resolve, reject) => {
            const date = new Date()
            switch (config.every) {
                case 'week':
                    if (config.everyCount && config.day && config.time) {
                        const timeStringComponents = config.time.split(':')
                        date.setDate(date.getDate() + (config.day + (7 - date.getDay())) % 7)

                        try {
                            date.setHours(parseInt(timeStringComponents[0], 0))
                            date.setMinutes(parseInt(timeStringComponents[1], 0))
                            resolve(date)
                        } catch (e) {
                            reject(new InternalError("Configuration requires format: hh:mm => 18:00"))
                        }
                    } else {
                        reject(new InternalError('No every count configured'))
                    }
                    break
                default:
                    reject(new InternalError('Configuration property does not exist'))
            }

            resolve(new Date())
        })
    }

    private async scheduleMovieNight(
        config: AnnouncementConfiguration,
        movieNight: MovieNight,
        outChannel: TextChannel,
        movieNightDate: Date
    ) {
        const embed = await this.announcementBuilderController.buildMovieNight(
            movieNight,
            config,
            movieNightDate
        )

        await outChannel.send({embeds: [embed]})
    }
}
