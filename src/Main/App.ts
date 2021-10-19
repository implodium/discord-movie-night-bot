import {inject, injectable} from "inversify";
import DiscordController from "./control/DiscordController";
import VotingController from "./control/VotingController";
import UserError from "./error/UserError"
import Logger from "./logger/Logger";
import EventController from "./control/EventController";
import CommandController from "./control/CommandController";
import AutoScheduleController from "./control/AutoScheduleController";
import MovieNightController from "./control/MovieNightController";
import InternalError from "./error/InternalError";

@injectable()
export default class App {

    public constructor(
        @inject(DiscordController) private discordController: DiscordController,
        @inject(VotingController) private votingController: VotingController,
        @inject(EventController) private eventController: EventController,
        @inject(CommandController) private commandController: CommandController,
        @inject(AutoScheduleController) private autoScheduleController: AutoScheduleController,
        @inject(MovieNightController) private movieNightController: MovieNightController,
        @inject(Logger) private log: Logger
    ) {
        this.init()
    }

    init() {
        this.log.info("Starting up ...")
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

    syncInit() {
        this.eventController.initEvents()
        this.movieNightController.init()
        this.eventController.errors
            .subscribe(this.handleError)
    }

    asyncInit(): Promise<[void, void, void, void]> {
        return Promise.all([
            this.commandController.init(),
            this.autoScheduleController.init(),
            this.votingController.updateMostVoted(),
            this.votingController.initVotingSystem()
        ])
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

    printWelcomingMessage(): void {
        const user = this.discordController.client.user
        if (user) {
            this.log.info(`logged in as ${user.tag}`)
        } else {
            throw new InternalError('client failed to initialize')
        }
    }
}
