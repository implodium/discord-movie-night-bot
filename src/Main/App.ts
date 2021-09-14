import {inject, injectable} from "inversify";
import DiscordController from "./control/DiscordController";
import VotingController from "./control/VotingController";

@injectable()
export default class App {

    public constructor(
        @inject(DiscordController) private discordController: DiscordController,
        @inject(VotingController) private votingController: VotingController
    ) {
        discordController.client.on('ready', () => {
            const user = discordController.client.user
            if (user) {
                console.log(`logged in as ${user.tag}`)
                votingController.updateMostVoted()
                    .catch(console.log)
            }
        })
    }
}
