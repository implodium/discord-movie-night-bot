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
        let multiplier = 0;
        const events = this.getEvents(guildConfig)

        if (events.length !== 0) {
            for (const event of events) {
                if (this.isEvent(event)) {
                    this.logger.debug('is event ' + message.content)
                    if (event.emoji) {
                        if (this.doesMessageHaveEmoji(message, event.emoji)) {
                            if (event.eventMultiplier) {
                                multiplier += event.eventMultiplier
                            } else {
                                multiplier += 2
                            }
                        } else {
                            if (event.normalMultiplier) {
                                multiplier += event.normalMultiplier
                            } else {
                                multiplier += 1
                            }
                        }
                    } else {
                        throw new InternalError('emoji is missing in event configuration')
                    }
                }
            }
        } else {
            multiplier = 1
        }



        this.logger.debug(multiplier)

        return multiplier
    }

    private isEvent(event: EventConfig): boolean {
        if (event.start && event.end) {
            const [eventStartDay, eventStartMonth] = event.start.split('.')
                .map(text => parseInt(text, 0))

            const [eventEndDay, eventEndMonth] = event.end.split('.')
                .map(text => parseInt(text, 0))

            const currentDate = new Date()
            const startDate = new Date(currentDate.getFullYear(), eventStartMonth - 1, eventStartDay, 0)
            const endDate = new Date(currentDate.getFullYear(), eventEndMonth - 1, eventEndDay, 24)

            return currentDate >= startDate && currentDate <= endDate
        } else {
            throw new InternalError('event boundaries not set')
        }
    }

    private doesMessageHaveEmoji(message: Message, emoji: string) {
        return message.reactions
            .valueOf()
            .filter(reaction => reaction.emoji.name === emoji)
            .size !== 0
    }

    private getEvents(guildConfig: GuildConfiguration): EventConfig[] {
        if (guildConfig.id) {
            const events: EventConfig[] = this.configController
                .getConfig(`guilds.${guildConfig.id}.events`)

            return events
                .filter(event => this.isEvent(event))
        } else {
            throw new InternalError('guild id was not set in configuration')
        }
    }
}
