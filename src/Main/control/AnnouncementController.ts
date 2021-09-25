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
import * as cron from 'node-cron'

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

            await this.initScheduler(announcementConfig, announcementChannel)
        }
    }

    async initScheduler(config: AnnouncementConfiguration, outChannel: TextChannel) {
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
    ) {
        if (config.announcementTime) {
            const scheduleString = await AnnouncementController.getScheduleString(config, -config.announcementTime)
            this.logger.debug(scheduleString)
            cron.schedule(scheduleString, async () => {
                this.logger.debug("now announcing on schedule")
                const dateOfMovieNight = await this.getDate(config)
                this.logger.debug(dateOfMovieNight)
                const embed = await this.announcementBuilderController.buildMovieNight(
                    movieNight,
                    config,
                    dateOfMovieNight
                )

                await outChannel.send({embeds: [embed]})
            })
        }
    }

    // offset number of days before (-) or after (+) the movie night
    private static async getScheduleString(config: AnnouncementConfiguration, offSet: number): Promise<string> {
        if (config.every && config.day && config.time) {
            switch (config.every) {
                case 'week':
                    let weekDay = config.day + offSet
                    const [hour, minute] = config.time.split(':')

                    if (weekDay <= 0) {
                        weekDay = 7 + weekDay
                    } else if (weekDay > 7) {
                        weekDay = weekDay - 7
                    }

                    return `0 ${minute} ${hour} * * ${weekDay}`
                default:
                    throw new InternalError('Configuration property does not exist')
            }
        } else {
            throw new InternalError("there is configurations missing " +
                "for determining the scheduling string")
        }
    }
}
