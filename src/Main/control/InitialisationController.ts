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
import ConfigController from "./ConfigController";
import GuildConfigurations from "../config/GuildConfigurations";
import GuildConfiguration from "../config/GuildConfiguration";

@injectable()
export default class InitialisationController {

    constructor(
        @inject(Logger) private log: Logger,
        @inject(ConfigController) private configController: ConfigController,
        @inject(EventController) private eventController: EventController,
        @inject(MovieNightController) private movieNightController: MovieNightController,
        @inject(CommandController) private commandController: CommandController,
        @inject(AutoScheduleController) private autoScheduleController: AutoScheduleController,
        @inject(VotingController) private votingController: VotingController,
        @inject(DiscordController) private discordController: DiscordController
    ) {
    }

    init() {
        this.discordController.client.on('ready', async () => {
            try {
                this.systemInit()
                this.guildsInit()
                this.printWelcomingMessage()
            } catch (error) {
                this.handleError(error)
            }
        })
    }

    private systemInit() {
        this.syncSystemInit()
    }

    private guildsInit() {
        const guildConfigs: GuildConfigurations = this.configController.getGuildConfigurations()

        for (const [, guildConfig] of Object.entries(guildConfigs)) {
            this.asyncGuildInit(guildConfig)
            this.syncGuildInit(guildConfig)
        }
    }

    private printWelcomingMessage(): void {
        const user = this.discordController.client.user
        if (user) {
            this.log.info(`logged in as ${user.tag}`)
        } else {
            throw new InternalError('client failed to initialize')
        }
    }

    private syncSystemInit() {
        this.eventController.initEvents()
        this.eventController.errors
            .subscribe(this.handleError)
    }

    private asyncGuildInit(guildConfig: GuildConfiguration) {
        return [
            this.votingController.initGuild(guildConfig),
            this.autoScheduleController.initGuild(guildConfig),
            this.autoScheduleController.initGuild(guildConfig),
            this.commandController.initGuild(guildConfig),
        ]
    }

    private syncGuildInit(guildConfig: GuildConfiguration) {
        this.movieNightController.initGuild(guildConfig)
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
