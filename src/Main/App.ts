import {inject, injectable} from "inversify";
import DiscordController from "./control/DiscordController";
import VotingController from "./control/VotingController";
import UserError from "./error/UserError"
import Logger from "./logger/Logger";

@injectable()
export default class App {

    public constructor(
        @inject(DiscordController) private discordController: DiscordController,
        @inject(VotingController) private votingController: VotingController,
        @inject(Logger) private log: Logger
    ) {
        log.info("Starting up ...")

        new Promise((resolve, reject) => {
            discordController.client.on('ready', () => {
                const user = discordController.client.user
                if (user) {
                    log.info(`logged in as ${user.tag}`)

                    votingController.updateMostVoted()
                        .catch(reject)

                    votingController.initVotingSystem()
                        .catch(reject)
                }
            })
        }).catch((err) => this.handleError(err))
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
