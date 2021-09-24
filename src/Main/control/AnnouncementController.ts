import {inject, injectable} from "inversify";
import Logger from "../logger/Logger";
import ConfigController from "./ConfigController";
import GuildConfigurations from "../config/GuildConfigurations";
import DiscordController from "./DiscordController";
import InternalError from "../error/InternalError";
import {TextChannel} from "discord.js";
import AnnouncementBuilderController from "./AnnouncementBuilderController";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";

@injectable()
export default class AnnouncementController {

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(ConfigController) private configController: ConfigController,
        @inject(DiscordController) private discordController: DiscordController,
        @inject(AnnouncementBuilderController) private announcementBuilderController: AnnouncementBuilderController
    ) {}

    init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const guildConfigs: GuildConfigurations = this.configController.getConfig('guilds')

            for (const [id, guildConfig] of Object.entries(guildConfigs)) {
                if (guildConfig.announcementChannelId) {
                    this.discordController.getChannelOf(id, guildConfig.announcementChannelId)
                        .then(channel => {
                            if (channel.isText()) {
                                const textChannel = channel as TextChannel

                                this.configController
                                    .getAnnouncementConfigByGuildConfig(guildConfig)
                                    .then(config => {
                                        if (config.announcementMessages
                                            && config.announcementMessages.movieNight
                                            && config.announcementMessages.movieNightFinalDecision
                                            && config.announcementMessages.movieNightStart
                                        ) {
                                            const movieNight = config.announcementMessages.movieNight
                                            this.getDate(config)
                                                .then(date => {
                                                    this.announcementBuilderController
                                                        .buildMovieNight(movieNight, config, date)
                                                        .then(embed => {
                                                            textChannel.send({embeds: [embed]})
                                                                .then(message => {
                                                                    return this.announcementBuilderController
                                                                        .reactMovieNight(
                                                                            message, movieNight
                                                                        )
                                                                })
                                                                .then(resolve)
                                                                .catch(reject)
                                                        })
                                                        .catch(reject)
                                                })
                                                .catch(reject)
                                        }
                                    })
                                    .catch(reject)
                            } else {
                                reject(new InternalError("" +
                                    "configuration invalid. " +
                                    "Announcement channel needs" +
                                    " to be a text channel"
                                ))
                            }
                        })
                        .catch(reject)
                }
            }
        })
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
}
