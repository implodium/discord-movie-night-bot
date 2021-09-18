import {inject, injectable} from "inversify";
import ConfigController from "./ConfigController";
import InternalError from "../error/InternalError";
import Logger from "../logger/Logger";
import GuildConfiguration from "../config/GuildConfiguration";
import {VoteDisplayType} from "../util/VoteDisplayType";
import DiscordController from "./DiscordController";
import {GuildChannel} from "discord.js";

@injectable()
export default class VotingDisplayController {

    constructor(
        @inject(ConfigController) private configController: ConfigController,
        @inject(Logger) private logger: Logger,
        @inject(DiscordController) private discordController: DiscordController
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
            this.logger.warn("not implemented")
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
