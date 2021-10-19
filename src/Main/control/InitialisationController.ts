import {inject, injectable} from "inversify";
import EventController from "./EventController";
import MovieNightController from "./MovieNightController";
import CommandController from "./CommandController";
import AutoScheduleController from "./AutoScheduleController";
import VotingController from "./VotingController";
import DiscordController from "./DiscordController";
import InternalError from "../error/InternalError";
import UserError from "../error/UserError";
import Logger from "../logger/Logger";

@injectable()
export default class InitialisationController {

    constructor(
        @inject(Logger) private log: Logger,
        @inject(EventController) private eventController: EventController,
        @inject(MovieNightController) private movieNightController: MovieNightController,
        @inject(CommandController) private commandController: CommandController,
        @inject(AutoScheduleController) private autoScheduleController: AutoScheduleController,
        @inject(VotingController) private votingController: VotingController,
        @inject(DiscordController) private discordController: DiscordController
    ) {
    }

    private syncInit() {
        this.eventController.initEvents()
        this.movieNightController.init()
        this.eventController.errors
            .subscribe(this.handleError)
    }

    private asyncInit() {
        return Promise.all([
            this.commandController.init(),
            this.autoScheduleController.init(),
            this.votingController.updateMostVoted(),
            this.votingController.initVotingSystem()
        ])
    }

    init() {
        this.discordController.client.on('ready', async () => {
            try {
                this.syncInit()
                await this.asyncInit()
                this.printWelcomingMessage()
            } catch (error) {
                this.handleError(error)
            }
        })
    }

    printWelcomingMessage(): void {
        const user = this.discordController.client.user
        if (user) {
            this.log.info(`logged in as ${user.tag}`)
        } else {
            throw new InternalError('client failed to initialize')
        }
    }

    handleError(err: any) {
        if (err !== undefined) {

            if(err.type === 'user') {
                const userError = err as UserError
                this.discordController.sendError(userError.guildId, userError.output)
                    .catch(handelErr  => this.handleError(handelErr))

                this.log.error(userError.stack)
            } else if (err.type === 'internal') {
                this.log.error(err.output)
                this.log.error(err.stack)
            } else {
                this.log.error(err.stack)
            }
        }
    }
}
