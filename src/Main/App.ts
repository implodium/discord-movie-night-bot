import {inject, injectable} from "inversify";
import DiscordController from "./control/DiscordController";

@injectable()
export default class App {

    public constructor(
        @inject(DiscordController) private discordController: DiscordController
    ) {
        discordController.client.on('ready', () => {
            const user = discordController.client.user
            if (user) {
                console.log(`logged in as ${user.tag}`)
            }
        })
    }
}
