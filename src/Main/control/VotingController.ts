import {inject, injectable} from "inversify";
import DiscordController from "./DiscordController";
import ConfigController from "./ConfigController";
import {Client, GuildChannel, Message, TextChannel} from "discord.js";
import Logger from "../logger/Logger";
import UserError from "../error/UserError";
import GuildConfigurations from "../config/GuildConfigurations";
import InternalError from "../error/InternalError";
import VotingDisplayController from "./VotingDisplayController";

@injectable()
export default class VotingController {

    private discordClient: Client

    constructor(
        @inject(DiscordController) private discordController: DiscordController,
        @inject(ConfigController) private configController: ConfigController,
        @inject(VotingDisplayController) private displayController: VotingDisplayController,
        @inject(Logger) private logger: Logger
    ) {
        this.discordClient = discordController.client
    }

    async updateMostVoted(): Promise<void>{
        return new Promise((resolve, reject) => {
            this.logger.info("updating most voted")
            const guildConfigs: GuildConfigurations = this.configController.getConfig("guilds")

            for (const [id, guildConfig] of Object.entries(guildConfigs)) {
                if (guildConfig.votingChannelId) {
                    this.discordController.getChannelOf(id, guildConfig.votingChannelId)
                        .then(channel => {
                            if (channel.type === "GUILD_TEXT") {
                                const textChannel = channel as TextChannel
                                this.countVotes(textChannel)
                                    .then(countResults => this.getMostVoted(countResults))
                                    .then(votingResults => this.displayController.displayVotingResult(votingResults, guildConfig))
                                    // .then(countResults => this.displayMostVoted(countResults, textChannel))
                                    .then(resolve)
                                    .catch(reject)
                            } else {
                                reject("Channel is not text channel please check your config")
                            }
                        })
                        .catch(reject)
                } else {
                    reject(new InternalError("configuration is invalid"))
                }
            }
        })

    }

    async displayMostVoted(reactionResults: Map<string, number>, channel: GuildChannel): Promise<void> {
        return new Promise((resolve, reject) => {
            if (reactionResults.size === 1) {
                reactionResults.forEach((counts, name) => {
                    const basename = channel.name.split('§')[0];
                    // console.log(`${basename}-§-${name}`)
                    channel.setName(`${basename}-§-${name}`)
                        .then(() => resolve())
                        .catch(reject)
                })
            } else {
                channel.setName( `${channel.name}: ${reactionResults.size} Winner`)
                    .then(() => resolve())
                    .catch(reject)
            }
        })
    }

    async countVotes(channel: TextChannel): Promise<Map<string, number>> {
        return new Promise((resolve, reject) => {
            const reactionResults = new Map<string, number>()

            this.discordController.getMessagesFrom(channel)
                .then(messages => {
                    const messagesCount = messages.size

                    messages.forEach(message => {
                        const thumbsUpReactionsPromise = this.discordController.count('👍', message)
                        const thumbsDownReactionsPromise = this.discordController.count('👎', message)

                        Promise.all([thumbsUpReactionsPromise, thumbsDownReactionsPromise])
                            .then( reactions => {
                                const thumbsUp = reactions[0]
                                const thumbsDown = reactions[1]

                                const result = thumbsUp - thumbsDown
                                reactionResults.set(message.content, result)

                                if (reactionResults.size === messagesCount) {
                                    resolve(reactionResults)
                                }
                            })
                            .catch(reject)
                    })
                })
                .catch(reject)
        })
    }

    private getMostVoted(countResults: Map<string, number>): Promise<Map<string, number>> {
        return new Promise((resolve, reject) => {
            const mostVoted = new Map<string, number>()
            let idOfMostVoted: string;
            let countOfMostVoted: number;

            countResults.forEach((counts, id) => {
                if (idOfMostVoted === undefined && countOfMostVoted === undefined) {
                    mostVoted.set(id, counts)
                    idOfMostVoted = id
                    countOfMostVoted = counts
                } else if (idOfMostVoted !== undefined && countOfMostVoted !== undefined) {
                    if(counts > countOfMostVoted) {
                        mostVoted.clear()
                        mostVoted.set(id, counts)
                        idOfMostVoted = id
                        countOfMostVoted = counts
                    } else if (counts === countOfMostVoted) {
                        mostVoted.set(id, counts)
                    }
                }
            })

            if(mostVoted.size <= 0) {
                reject('something went wrong most voted could not be evaluated')
            } else {
                resolve(mostVoted)
            }

        })
    }

    initVotingSystem(): Promise<void> {
        this.logger.info("initializing voting System")
        const guildConfigs: GuildConfigurations = this.configController.getGuildConfigurations()

        return new Promise((resolve, reject) => {
            for (const [id, guildConfig] of Object.entries(guildConfigs)) {
                if (guildConfig.votingChannelId) {
                    this.discordController.getChannelOf(id, guildConfig.votingChannelId)
                        .then(channel => {
                            if (channel.isText()) {
                                const textChannel = channel as TextChannel
                                this.logger.info(`initiating '${textChannel.guild.name}' Guild`)
                                this.logger.info(`initiating '${textChannel.name}' voting channel`)

                                textChannel.messages.fetch()
                                    .then(snowflakes => snowflakes.forEach(message => this.makeStandardReactions(message)))
                                    .then(() => this.logger.info('initiated reactions'))
                                    .then(() => resolve())
                                    .catch(reject)
                            } else {
                                reject(new UserError('wrong configured voting channel', id))
                            }
                        })
                        .catch(reject)
                } else {
                    reject(new InternalError("invalied Configuration"))
                }
            }
        })
    }

    makeStandardReactions(message: Message): Promise<void> {
        return new Promise((resolve, reject) => {
            message.react('👍')
                .catch(reject)

            message.react('👎')
                .catch(reject)
        })
    }
}
