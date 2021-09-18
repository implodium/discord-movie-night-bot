import {inject, injectable} from "inversify";
import ConfigController from "./ConfigController";
import {
    Channel,
    Client,
    Collection,
    Guild, GuildChannel,
    Intents,
    Message,
    Snowflake,
    TextChannel
} from "discord.js";
import GuildConfiguration from "../config/GuildConfiguration";
import InternalError from "../error/InternalError";
import Logger from "../logger/Logger";

@injectable()
export default class DiscordController {

    private readonly _client: Client

    constructor(
        @inject(ConfigController) private configController: ConfigController,
        @inject(Logger) private logger: Logger
    ) {
        this._client = new Client({ intents: Intents.FLAGS.GUILDS })
        this.init()
    }

    init() {
        const token = this.configController.getEnv('DISCORD_TOKEN')

        if (token) {
            this._client.login(token)
                .catch(this.logger.error)
        } else {
            throw new Error("No Token present")
        }
    }

    public get client(): Client {
        return this._client
    }

    public getChannelOf(guildId: string, channelId: string): Promise<Channel> {
        return new Promise((resolve, reject) => {
            this.getGuildBy(guildId)
                .then(guild => {
                    guild.channels.fetch()
                        .then(snowflakes => {
                            const channelSnowflake = snowflakes.get(channelId)
                            if (channelSnowflake) {
                                channelSnowflake.fetch()
                                    .then(channel => {
                                        resolve(channel)
                                    })
                                    .catch(reject)
                            } else {
                                reject('invalid snowflake')
                            }
                        })
                        .catch(reject)
                })
                .catch(reject)
        })
    }

    public getGuildBy(id: string): Promise<Guild> {
        return new Promise((resolve, reject) => {
            this._client.guilds.fetch()
                .then(snowflakes => {
                    snowflakes.get(id)?.fetch()
                        .then(resolve)
                        .catch(reject)
                })
                .catch(reject)
        })
    }

    getMessagesFrom(channel: TextChannel): Promise<Collection<Snowflake, Message>> {
        return channel.messages.fetch()
    }

    count(reactionEmoji: string, of: Message): Promise<number> {
        return new Promise((resolve, reject) => {
            const reaction = of.reactions.valueOf().filter(reactionEntry => {
                return reactionEntry.emoji.name === reactionEmoji
            }).first()

            if (reaction) {
                resolve(reaction.count)
            } else {
                reject('reaction => ' + reactionEmoji + ' not found')
            }
        })
    }

    sendError(guildId: string, message: string): Promise<void> {
        const guildConfig: GuildConfiguration = this.configController.getConfig(`guilds.${guildId}`)

        return new Promise((resolve, reject) => {
            if (guildConfig.errChannel) {
                this.getChannelOf(guildId, guildConfig.errChannel)
                    .then(channel => channel as TextChannel)
                    .then(textChannel => {
                        textChannel.send(message)
                            .then(reject)
                    })
                    .catch(() => reject(new InternalError("something went wrong with the error handling")))

            } else {
                reject(new InternalError("invalid configuration"))
            }
        })
    }

    getMessageOf(channel: TextChannel, messageId: string): Promise<Message> {
        return new Promise((resolve, reject) => {
            channel.messages.fetch(messageId)
                .then(message => {
                    resolve(message)
                })
                .catch(reject)
        })
    }
}
