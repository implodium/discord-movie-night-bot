import {inject, injectable} from "inversify";
import DiscordController from "./control/DiscordController";
import VotingController from "./control/VotingController";
import UserError from "./error/UserError"
import InternalError from "./error/InternalError";

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
        }).catch(console.log)
    }

    handleError(err: any) {
        if(err instanceof UserError) {
            this.discordController.sendError(err.guildId, err.toString())
                .catch(this.handleError)
        } else if (err instanceof InternalError) {
            console.log(err.toString())
        } else {
            console.log(err)
        }
    }
}
