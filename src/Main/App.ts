import {inject, injectable} from "inversify";
import Logger from "./logger/Logger";
import InitialisationController from "./control/InitialisationController";

@injectable()
export default class App {

    public constructor(
        @inject(Logger) private logger: Logger,
        @inject(InitialisationController) private initController: InitialisationController
    ) {
        this.logger.info("Starting up ...")
        this.initController.init()
    }

}
