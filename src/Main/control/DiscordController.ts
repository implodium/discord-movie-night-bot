import {inject, injectable} from "inversify";
import ConfigController from "./ConfigController";
import {Client, Intents} from "discord.js";

@injectable()
export default class DiscordController {

    private readonly _client: Client

    constructor(
        @inject(ConfigController) private configController: ConfigController
    ) {
        this._client = new Client({ intents: Intents.FLAGS.GUILDS })
        this.init()
    }

    init() {
        const token = this.configController.getEnv('DISCORD_TOKEN')

        if (token) {
            this._client.login(token)
                .catch(console.log)
        } else {
            throw new Error("No Token present")
        }
    }

    public get client(): Client {
        return this._client
    }
}
