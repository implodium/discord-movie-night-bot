import {inject, injectable} from "inversify";
import DiscordController from "./DiscordController";
import ConfigController from "./ConfigController";
import {Client, Guild, GuildChannel, Message, TextChannel} from "discord.js";
import Logger from "../logger/Logger";
import InternalError from "../error/InternalError";
import VotingDisplayController from "./VotingDisplayController";
import {BehaviorSubject, Observable} from "rxjs";
import {filter} from "rxjs/operators";
import GuildConfiguration from "../config/GuildConfiguration";
import MovieNightEventController from "./MovieNightEventController";

@injectable()
export default class VotingController {

    private discordClient: Client
    private _mostVoted = new BehaviorSubject<Map<string, number> | undefined>(undefined)

    constructor(
        @inject(DiscordController) private discordController: DiscordController,
        @inject(ConfigController) private configController: ConfigController,
        @inject(VotingDisplayController) private displayController: VotingDisplayController,
        @inject(MovieNightEventController) private movieNightEventController: MovieNightEventController,
        @inject(Logger) private logger: Logger
    ) {
        this.discordClient = discordController.client
    }

    async initGuild(guildConfig: GuildConfiguration) {
        await this.updateMostVoted(guildConfig)
        await this.initVotingSystem(guildConfig)

    }

    async updateMostVoted(guildConfig: GuildConfiguration): Promise<void>{
        return new Promise((resolve, reject) => {
            this.logger.info("updating most voted")

            if (guildConfig.votingChannelId && guildConfig.id) {
                this.discordController.getChannelOf(guildConfig.id, guildConfig.votingChannelId)
                    .then(channel => {
                        if (channel.type === "GUILD_TEXT") {
                            const textChannel = channel as TextChannel
                            this.countVotes(textChannel, guildConfig)
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

    async countVotes(channel: TextChannel, guildConfig: GuildConfiguration): Promise<Map<string, number>> {
        const reactionResults = new Map<string, number>()
        const messages = await this.discordController.getMessagesFrom(channel)

        for (const message of Array.from(messages.values())) {
            const multiplier = this.movieNightEventController.getMultiplier(message, guildConfig)
            const [thumbsUpReactions, thumbsDownReactions] =  await Promise.all([
                this.discordController.count('👍', message),
                this.discordController.count('👎', message)
            ])

            const result = thumbsUpReactions * multiplier - thumbsDownReactions
            reactionResults.set(message.content, result)
        }

        if (reactionResults.size === messages.size) {
            return reactionResults
        } else throw new InternalError(
            'counting votes failed something went wrong'
        )
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
                this._mostVoted.next(mostVoted)
                resolve(mostVoted)
            }

        })
    }

    initVotingSystem(guildConfig: GuildConfiguration): Promise<void> {
        this.logger.info("initializing voting System")

        return new Promise((resolve, reject) => {
            if (guildConfig.votingChannelId && guildConfig.id) {
                this.discordController.getChannelOf(guildConfig.id, guildConfig.votingChannelId)
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
                            reject(new InternalError('wrong configured voting channel'))
                        }
                    })
                    .catch(reject)
            } else {
                reject(new InternalError("invalid Configuration"))
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

    isVotingChannel(channel: TextChannel, guild: Guild): boolean {
        const votingChannelId = this.configController.getConfig(`guilds.${guild.id}.votingChannelId`)

        return channel.id === votingChannelId
    }

    get mostVoted(): Observable<Map<string, number>> {
        return this._mostVoted
            .pipe(
                filter(value => value !== undefined)
            ) as Observable<Map<string, number>>
    }
}
