import {inject, injectable} from "inversify";
import ConfigController from "./control/ConfigController";

@injectable()
export default class App {

    public constructor(
        @inject(ConfigController) private configController: ConfigController
    ) { }
}
