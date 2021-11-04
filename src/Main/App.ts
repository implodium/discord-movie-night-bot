import {inject, injectable} from "inversify";
import Logger from "./logger/Logger";
import InitialisationController from "./control/InitialisationController";
import DiscordController from "./control/DiscordController";

@injectable()
export default class App {

    public constructor(
        @inject(Logger) private logger: Logger,
        @inject(InitialisationController) private initController: InitialisationController,
        @inject(DiscordController) private discordController: DiscordController
    ) {
        this.logger.info("Starting up ...")
        this.discordController.client.on('ready', async () => {
            this.initController.init()
        })
    }

}
