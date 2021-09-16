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
                            this.displayChannelName()
                                .catch(reject)
                            break
                        case VoteDisplayType.CHANNEL_NAME_POSTFIX:
                            this.displayChannelNamePostFix()
                                .catch(reject)
                            break
                        case VoteDisplayType.CHANNEL_MESSAGE:
                            this.displayChannelMessage()
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

    private displayChannelName(): Promise<void> {
        return new Promise((resolve, reject) => {

        })
    }

    private displayChannelNamePostFix(): Promise<void> {
        return new Promise((resolve, reject) => {

        })
    }

    private displayChannelMessage(): Promise<void> {
        return new Promise((resolve, reject) => {

        })
    }
}
