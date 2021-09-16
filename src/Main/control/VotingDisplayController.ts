import {inject, injectable} from "inversify";
import ConfigController from "./ConfigController";
import InternalError from "../error/InternalError";
import Logger from "../logger/Logger";
import GuildConfiguration from "../config/GuildConfiguration";
import {VoteDisplayType} from "../util/VoteDisplayType";

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
                    switch (displayType) {
                        case VoteDisplayType.CHANNEL_NAME:
                            this.displayChannelName(votingResult)
                                .catch(reject)
                            break
                        case VoteDisplayType.CHANNEL_NAME_POSTFIX:
                            this.displayChannelNamePostFix(votingResult)
                                .catch(reject)
                            break
                        case VoteDisplayType.CHANNEL_MESSAGE:
                            this.displayChannelMessage(votingResult)
                                .catch(reject)
                            break
                    }
                    this.logger.debug(displayType)
                }
            } else {
                reject(new InternalError("configuration not valid"))
            }
        })
    }

    private displayChannelName(votingResult: Map<string, number>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.logger.warn("not implemented")
        })
    }

    private displayChannelNamePostFix(votingResult: Map<string, number>): Promise<void> {
        return new Promise((resolve, reject) => {

        })
    }

    private displayChannelMessage(votingResult: Map<string, number>): Promise<void> {
        return new Promise((resolve, reject) => {
            this.logger.warn("not implemented")
        })
    }
}
