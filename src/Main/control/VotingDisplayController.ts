import {inject, injectable} from "inversify";
import ConfigController from "./ConfigController";
import InternalError from "../error/InternalError";
import Logger from "../logger/Logger";
import GuildConfiguration from "../config/GuildConfiguration";
import {VoteDisplayType} from "../util/VoteDisplayType";
import DiscordController from "./DiscordController";
import {GuildChannel, MessageEmbed, TextChannel} from "discord.js";
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
                                .then(() => resolve())
                                .catch(reject)
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
        this.logger.info('displaying ChannelMessage')

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
                                    if (storage.winnerMessageIds && guildConfig.id && storage.winnerMessageIds[guildConfig.id]) {
                                        this.logger.info("updating message")
                                        this.updateDisplayMessage(winningTextChannel, storage.winnerMessageIds[guildConfig.id], votingResult)
                                            .then(() => resolve())
                                            .catch(reject)
                                    } else {
                                        this.logger.info("sending message")
                                        this.sendDisplayMessage(winningTextChannel, votingResult, guildConfig)
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

    private sendDisplayMessage(textChannel: TextChannel, votingResult: Map<string, number>, guildConfig: GuildConfiguration): Promise<void> {
        return new Promise((resolve, reject) => {
            textChannel.send({embeds: [this.getEmbed(votingResult)]})
                .then(message => {
                    const storage: Storage = {
                        winnerMessageIds: {}
                    }

                    if (storage.winnerMessageIds && guildConfig.id) {
                        storage.winnerMessageIds[guildConfig.id] = message.id

                        this.storageController.write(storage)
                            .then(() => resolve())
                            .catch(reject)

                    }
                })
                .catch(reject)

        })
    }

    private updateDisplayMessage(textChannel: TextChannel, messageId: string, votingResult: Map<string, number>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.discordController.getMessageOf(textChannel, messageId)
                .then(message => {
                    message.edit({embeds: [this.getEmbed(votingResult)]})
                        .then(() => resolve())
                        .catch(reject)
                    resolve()
                })
                .catch(reject)
        })
    }

    private getEmbed(votingResult: Map<string, number>): MessageEmbed {
        const embed = VotingDisplayController.defaultEmbed

        if (votingResult.size > 1) {
            this.setEmbedForMultipleWinner(embed, votingResult)
        } else {
            this.setEmbedForOneWinner(embed, votingResult)
        }

        return embed
    }

    private setEmbedForMultipleWinner(embed: MessageEmbed, votingResult: Map<string, number>) {
        embed.setDescription("Movies with the highest vote count: ")
            .setTitle("Most voted movies")
        votingResult.forEach((count, name) => {
            embed.addField(name, `${count} votes`, true)
        })

        embed.addField('\u200B', '\u200B')
    }

    private setEmbedForOneWinner(embed: MessageEmbed, votingResult: Map<string, number>) {
        embed.setDescription("The most voted Movie is: ")
            .setTitle("Most voted movie")

        let first = true
        votingResult.forEach((count, name) => {
            if (first) {
                embed.addField(name, `${count} votes`)
                first = false
            }
        })

        embed.addField('\u200B', '\u200B')
    }

    private static get defaultEmbed() {
        const c = new Date()
        const dateString = `${c.getDate()}.${c.getMonth() + 1}.${c.getFullYear()} `
        const timeString = `${c.getHours()}:${c.getMinutes()}:${c.getSeconds()}`
        return new MessageEmbed()
            .setColor("RED")
            .addField('\u200B', '\u200B')
            .setFooter(
                `Last updated ${dateString} ${timeString}`
            )
    }

    private static getBaseName(name: string) {
        return name.split('-§-')[0];
    }

    private displayChannelNamePostFixIn(channel: GuildChannel, votingResult: Map<string, number>): Promise<void> {
        return new Promise((resolve, reject) => {
            const basename = VotingDisplayController.getBaseName(channel.name)
            let first = true

            if (votingResult.size === 1) {
                votingResult.forEach((counts, name) => {
                    if (first) {
                        channel.setName(`${basename}-§-${name}`)
                            .then(() => resolve())
                            .catch(reject)

                        first = false
                    }
                })
            } else {
                channel.setName( `${basename}-§-${votingResult.size}-winner`)
                    .then(() => resolve())
                    .catch(reject)
            }
        })
    }
}
