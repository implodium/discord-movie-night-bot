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
import MovieNightFinalDecision from "../util/announcements/MovieNightFinalDecision";
import MovieNightStart from "../util/announcements/MovieNightStart";

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

            await this.initScheduler(announcementConfig, announcementChannel, guildConfig)
        }
    }

    async initScheduler(config: AnnouncementConfiguration, outChannel: TextChannel, guildConfig: GuildConfiguration) {
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

            await this.scheduleMovieNightFinalDecision(
                config,
                config.announcementMessages.movieNightFinalDecision,
                outChannel
            )

            await this.scheduleMovieNightStart(
                config,
                config.announcementMessages.movieNightStart,
                outChannel,
                guildConfig
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
            cron.schedule(scheduleString, async () => {
                const dateOfMovieNight = await this.getDate(config)
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
    private static async getScheduleString(config: AnnouncementConfiguration, offSet: number = 0): Promise<string> {
        if (config.every && config.day && config.time && config.everyCount) {
            switch (config.every) {
                case 'week':
                    let weekDay = config.day + offSet
                    const [hour, minute] = config.time.split(':')

                    if (weekDay <= 0) {
                        weekDay = 7 + weekDay
                    } else if (weekDay > 7) {
                        weekDay = weekDay - 7
                    }

                    return `0 ${minute} ${hour} * * ${weekDay}/${config.everyCount}`
                default:
                    throw new InternalError('Configuration property does not exist')
            }
        } else {
            throw new InternalError("there is configurations missing " +
                "for determining the scheduling string")
        }
    }

    private async scheduleMovieNightFinalDecision(
        config: AnnouncementConfiguration,
        announcement: MovieNightFinalDecision,
        outChannel: TextChannel
    ) {
        const scheduleString = await AnnouncementController.getScheduleString(config, -1)
        cron.schedule(scheduleString, async () => {
            await this.sendMovieNightFinalDecision(
                config,
                announcement,
                outChannel
            )
        })
    }

    private async scheduleMovieNightStart(
        config: AnnouncementConfiguration,
        announcement: MovieNightStart,
        outChannel: TextChannel,
        guildConfig: GuildConfiguration
    ) {
        const scheduleString = await AnnouncementController.getScheduleString(config)
        cron.schedule(scheduleString, async () => {
            await this.sendMovieNightStart(
                announcement,
                config,
                guildConfig,
                outChannel
            )
        })
    }

    private async sendMovieNightStart(
        announcement: MovieNightStart,
        config: AnnouncementConfiguration,
        guildConfig: GuildConfiguration,
        outChannel: TextChannel
    ) {
        const embed = await this.announcementBuilderController.buildMovieNightStart(
            announcement,
            config,
            guildConfig
        )

        await outChannel.send({embeds: [embed]})
    }

    private async sendMovieNightFinalDecision(
        config: AnnouncementConfiguration,
        announcement: MovieNightFinalDecision,
        outChannel: TextChannel
    ) {
        const embed = await this.announcementBuilderController.buildMovieNightFinalDecision(
            announcement,
            config
        )

        await outChannel.send({embeds: [embed]})
    }
}
