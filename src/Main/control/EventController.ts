import {inject, injectable} from "inversify";
import DiscordController from "./DiscordController";
import VotingController from "./VotingController";
import {Client} from "discord.js";
import Logger from "../logger/Logger";
import {Observable, Subject} from "rxjs";

@injectable()
export default class EventController {

    private discordClient: Client
    private _errors = new Subject<any>()

    constructor(
        @inject(DiscordController) private discordController: DiscordController,
        @inject(VotingController) private votingController: VotingController,
        @inject(Logger) private logger: Logger
    ) {
        this.discordClient = discordController.client
    }

    initEvents() {
        this.logger.info("initiated events")

        this.discordClient.on('guildCreate', () => {
            this.votingController.initVotingSystem()
                .catch(this._errors.next)
        })

        this.discordClient.on('messageReactionAdd', (reaction, user) => {
            if (this.discordClient.user && user.id !== this.discordClient.user.id) {
                this.votingController.updateMostVoted()
                    .catch(this._errors.next)
            }
        })

        this.discordClient.on('messageReactionRemove', (reaction, user) => {
            if (this.discordClient.user && user.id !== this.discordClient.user.id) {
                this.votingController.updateMostVoted()
                    .catch(this._errors.next)
            }
        })

        this.discordClient.on('messageCreate', (message) => {
            this.votingController.makeStandardReactions(message)
                .catch(this._errors.next)
        })

    }

    get errors(): Observable<any> {
        return this._errors
    }
}
