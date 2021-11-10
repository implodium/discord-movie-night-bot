import {injectable} from "inversify";
import {Message} from "discord.js";
import GuildConfiguration from "../config/GuildConfiguration";

@injectable()
export default class MovieNightEventController {

    getMultiplier(message: Message, guildConfig: GuildConfiguration): number {
        return 1
    }

}
