import {inject, injectable} from "inversify";
import {Message} from "discord.js";
import GuildConfiguration from "../config/GuildConfiguration";
import ConfigController from "./ConfigController";
import EventConfig from "../config/EventConfig";
import Logger from "../logger/Logger";
import InternalError from "../error/InternalError";

@injectable()
export default class MovieNightEventController {

    constructor(
        @inject(ConfigController) private configController: ConfigController,
        @inject(Logger) private logger: Logger
    ) {
    }

    getMultiplier(message: Message, guildConfig: GuildConfiguration): number {
        if (guildConfig.id) {
            const events: EventConfig[] = this.configController
                .getConfig(`guilds.${guildConfig.id}.events`)

            const event = events[0]

            if (event.emoji) {
                if (this.doesMessageHaveEmoji(message, event.emoji)) {
                    if (event.eventMultiplier) {
                        return event.eventMultiplier
                    } else {
                        return 2
                    }
                } else {
                    if (event.normalMultiplier) {
                        return event.normalMultiplier
                    } else {
                        return 1
                    }
                }
            } else {
                throw new InternalError('emoji is missing in event configuration')
            }
        }
        return 1
    }

    private doesMessageHaveEmoji(message: Message, emoji: string) {
        return message.reactions
            .valueOf()
            .filter(reaction => reaction.emoji.name === emoji)
            .size !== 0
    }
}
