import {inject, injectable} from "inversify";
import DiscordController from "./DiscordController";
import VotingController from "./VotingController";
import {Client, MessageReaction, PartialMessageReaction, PartialUser, TextChannel, User} from "discord.js";
import Logger from "../logger/Logger";
import {Observable, Subject} from "rxjs";
import ConfigController from "./ConfigController";

@injectable()
export default class EventController {

    private discordClient: Client
    private _errors = new Subject<any>()

    constructor(
        @inject(DiscordController) private discordController: DiscordController,
        @inject(VotingController) private votingController: VotingController,
        @inject(ConfigController) private configController: ConfigController,
        @inject(Logger) private logger: Logger
    ) {
        this.discordClient = discordController.client
    }

    initEvents() {
        this.logger.info("initiated events")

        this.discordClient.on('guildCreate', guild => {
            const guildConfig = this.configController.getConfigurationByGuildId(guild.id)
            this.votingController.initGuild(guildConfig)
                .catch(this._errors.next)
        })

        this.discordClient.on('messageReactionAdd', (reaction, user) => {
            this.reactionUpdate(reaction, user)
        })

        this.discordClient.on('messageReactionRemove', (reaction, user) => {
            this.reactionUpdate(reaction, user)
        })

        this.discordClient.on('messageCreate', (message) => {
            const channel = message.channel as TextChannel
            const guild = channel.guild

            if (this.votingController.isVotingChannel(channel, guild)) {
                this.votingController.makeStandardReactions(message)
                    .catch(this._errors.next)
            }
        })

    }

    get errors(): Observable<any> {
        return this._errors
    }

    private reactionUpdate(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
        const channel = reaction.message.channel as TextChannel
        const guild = channel.guild
        const guildConfig = this.configController.getConfigurationByGuildId(guild.id)

        if (this.votingController.isVotingChannel(channel, guild)
            && this.discordClient.user
            && user.id !== this.discordClient.user.id
            && reaction.emoji.name
            && ['👍', '👎'].includes(reaction.emoji.name)
        ) {
            this.votingController.updateMostVoted(guildConfig)
                .catch(this._errors.next)
        }
    }
}
