import {inject, injectable} from "inversify";
import Logger from "../logger/Logger";
import ConfigController from "./ConfigController";
import GuildConfigurations from "../config/GuildConfigurations";
import DiscordController from "./DiscordController";
import InternalError from "../error/InternalError";
import {MessageEmbed, TextChannel} from "discord.js";
import AnnouncementBuilderController from "./AnnouncementBuilderController";

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
                                            && config.announcementMessages.movieNightReminder
                                            && config.announcementMessages.finalMovieDecision
                                            && config.announcementMessages.finalMovieNight
                                        ) {
                                            const movieNightReminder = config.announcementMessages.movieNightReminder
                                            this.announcementBuilderController
                                                .buildFinalMovieDecisionAnnouncement(movieNightReminder)
                                                .then(announcement => {
                                                    textChannel.send({embeds: [{}]})
                                                        .then(() => resolve())
                                                        .catch(reject)
                                                })
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
}
