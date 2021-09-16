import {inject, injectable} from "inversify";
import ConfigController from "./ConfigController";
import InternalError from "../error/InternalError";
import Logger from "../logger/Logger";
import GuildConfiguration from "../config/GuildConfiguration";

@injectable()
export default class VotingDisplayController {

    constructor(
        @inject(ConfigController) private configController: ConfigController,
        @inject(Logger) private logger: Logger
    ) {
    }


    displayVotingResult(votingResult: Map<string, number>, guildConfig: GuildConfiguration): Promise<void> {
        return new Promise((resolve, reject) => {

            if(guildConfig && guildConfig.votingDisplayTypes) {
                for (const displayType of guildConfig.votingDisplayTypes) {
                    this.logger.debug(displayType)
                }
            } else {
                reject(new InternalError("configuration not valid"))
            }
        })
    }

}
