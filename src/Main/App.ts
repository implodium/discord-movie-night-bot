import {inject, injectable} from "inversify";
import DiscordController from "./control/DiscordController";
import VotingController from "./control/VotingController";
import UserError from "./error/UserError"

@injectable()
export default class App {

    public constructor(
        @inject(DiscordController) private discordController: DiscordController,
        @inject(VotingController) private votingController: VotingController
    ) {
        new Promise((resolve, reject) => {
            discordController.client.on('ready', () => {
                const user = discordController.client.user
                if (user) {
                    console.log(`logged in as ${user.tag}`)
                    votingController.updateMostVoted()
                        .catch(reject)
                }
            })
        }).catch((err) => this.handleError(err))
    }

    handleError(err: any) {
        if(err.type === 'user') {
            const userError = err as UserError
            this.discordController.sendError(userError.guildId, userError.output)
                .catch(err => this.handleError(err))

            console.log(userError.stack)
        } else if (err.type === 'internal') {
            console.log(err.output)
            console.log(err.stack)
        } else {
            console.log(err.message)
            console.log(err.stack)
        }
    }
}
