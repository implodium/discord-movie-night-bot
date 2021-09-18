import {inject, injectable} from "inversify";
import ConfigController from "./ConfigController";
import InternalError from "../error/InternalError";
import Logger from "../logger/Logger";
import GuildConfiguration from "../config/GuildConfiguration";
import {VoteDisplayType} from "../util/VoteDisplayType";
import DiscordController from "./DiscordController";
import {GuildChannel, Message, MessageEmbed, TextChannel} from "discord.js";
import StorageController from "./StorageController";
import Storage from "../data/Storage";

@injectable()
export default class VotingDisplayController {

    constructor(
        @inject(ConfigController) private configController: ConfigController,
        @inject(Logger) private logger: Logger,
        @inject(DiscordController) private discordController: DiscordController,
        @inject(StorageController) private storageController: StorageController
    ) {
    }


    displayVotingResult(votingResult: Map<string, number>, guildConfig: GuildConfiguration): Promise<void> {
        return new Promise((resolve, reject) => {
            if(guildConfig && guildConfig.votingDisplayTypes) {
                for (const displayType of guildConfig.votingDisplayTypes) {
                    switch (displayType) {
                        case VoteDisplayType.CHANNEL_NAME:
                            this.displayChannelName(votingResult, guildConfig)
                                .catch(reject)
                            break
                        case VoteDisplayType.CHANNEL_NAME_POSTFIX:
                            this.displayChannelNamePostFix(votingResult, guildConfig)
                                .catch(reject)
                            break
                        case VoteDisplayType.CHANNEL_MESSAGE:
                            this.displayChannelMessage(votingResult, guildConfig)
                                .catch(reject)
                            break
                    }
                    this.logger.debug(displayType)
                }
            } else {
                reject(new InternalError("configuration not valid"))
            }
        })
    }

    private displayChannelName(votingResult: Map<string, number>, guildConfig: GuildConfiguration): Promise<void> {
        return new Promise((resolve, reject) => {
            this.logger.info('displaying ChannelName')

            if (guildConfig.winningChannelId && guildConfig.id) {
                this.discordController.getChannelOf(guildConfig.id, guildConfig.winningChannelId)
                    .then(anyChannel => anyChannel as GuildChannel)
                    .then(guildChannel => {
                        if (votingResult.size > 1) {
                            guildChannel.setName(`${votingResult.size} winner`)
                        } else {
                            let first = true

                            votingResult.forEach((count, name) => {
                                if (first) {
                                    guildChannel.setName(`${name}`)
                                        .then(() => resolve())
                                        .catch(reject)
                                    first = false
                                }
                            })
                        }
                    })
            }
        })
    }

    private displayChannelNamePostFix(votingResult: Map<string, number>, guildConfig: GuildConfiguration): Promise<void> {
        return new Promise((resolve, reject) => {
            this.logger.info('displaying ChannelNamePostFix')

            if(guildConfig.votingChannelId && guildConfig.id) {
                this.discordController.getChannelOf(guildConfig.id, guildConfig.votingChannelId)
                    .then(channel => channel as GuildChannel)
                    .then(guildChannel => this.displayChannelNamePostFixIn(guildChannel, votingResult))
                    .catch(reject)
            } else {
                reject(new InternalError("Configuration invalid"))
            }
        })
    }

    private displayChannelMessage(votingResult: Map<string, number>, guildConfig: GuildConfiguration): Promise<void> {
        return new Promise((resolve, reject) => {
            if (
                guildConfig.id &&
                guildConfig.winningChannelId &&
                guildConfig.id
            ) {
                this.discordController.getChannelOf(guildConfig.id, guildConfig.winningChannelId)
                    .then(winningChannel => {
                        if (winningChannel.isText()) {
                            return winningChannel as TextChannel
                        } else {
                            reject(new InternalError(
                                "winning channel is required to" +
                                " be a text channel when display" +
                                " type CHANNEL_MESSAGE is included"
                            ))
                        }
                    })
                    .then(winningTextChannel => {
                        if (winningTextChannel) {
                            this.storageController.get()
                                .then(storage => {
                                    if (storage.winnerMessageId) {
                                        this.logger.info("updating message")
                                        this.updateDisplayMessage(winningTextChannel)
                                    } else {
                                        this.logger.info("sending message")
                                        this.sendDisplayMessage(winningTextChannel)
                                            .then(() => resolve)
                                            .catch(reject)
                                    }
                                })
                        }
                    })
                    .catch(reject)
            }
        })
    }

    sendDisplayMessage(textChannel: TextChannel) {
        return new Promise((resolve, reject) => {
            textChannel.send({embeds: [this.embed]})
                .then(message => {
                    this.logger.debug(message)
                    this.storageController.write({
                        winnerMessageId: message.id
                    })
                        .then(resolve)
                        .catch(reject)
                })
                .catch(reject)

        })
    }

    private updateDisplayMessage(textChannel: TextChannel) {

    }

    get embed(): MessageEmbed {
        return new MessageEmbed({
            title: 'Most voted movie',
            description: "movies",
            color: 'RED',
            createdAt: new Date()
        })
    }

    private static getBaseName(name: string) {
        return name.split('-§-')[0];
    }

    private displayChannelNamePostFixIn(channel: GuildChannel, votingResult: Map<string, number>): Promise<void> {
        return new Promise((resolve, reject) => {
            const basename = VotingDisplayController.getBaseName(channel.name)
            this.logger.debug(basename)
            let first = true

            if (votingResult.size === 1) {
                votingResult.forEach((counts, name) => {
                    if (first) {
                        channel.setName(`${basename}-§-${name}`)
                            .then(() => resolve())
                            .catch(reject)

                        first = false
                    }

                    this.logger.debug(`${basename}-§-${name}`);
                })
            } else {
                channel.setName( `${basename}-§-${votingResult.size}-winner`)
                    .then(() => resolve())
                    .catch(reject)

                this.logger.debug(`${basename}-§-${votingResult.size} Winner`);
            }
        })
    }
}
