import {inject, injectable} from "inversify";
import DiscordController from "./DiscordController";
import VotingController from "./VotingController";
import {Client} from "discord.js";
import Logger from "../logger/Logger";

@injectable()
export default class EventController {

    private discordClient: Client

    constructor(
        @inject(DiscordController) private discordController: DiscordController,
        @inject(VotingController) private votingController: VotingController,
        @inject(Logger) private logger: Logger
    ) {
        this.discordClient = discordController.client
    }

    initEvents() {
        this.logger.info("initiated events")
        const init = new Array<Promise<void>>()

        this.discordClient.on('guildCreate', () => {
            init.push(this.votingController.initVotingSystem())
        })

        this.discordClient.on('messageReactionAdd', (reaction, user) => {
            if (this.discordClient.user && user.id !== this.discordClient.user.id) {
                init.push(this.votingController.updateMostVoted())
            }
        })

        this.discordClient.on('messageReactionRemove', (reaction, user) => {
            if (this.discordClient.user && user.id !== this.discordClient.user.id) {
                init.push(this.votingController.updateMostVoted())
            }
        })

    }
}
