import {injectable} from "inversify";
import {Message} from "discord.js";

@injectable()
export default class MovieNightEventController {

    getMultiplier(message: Message): number {
        return 1
    }

}
