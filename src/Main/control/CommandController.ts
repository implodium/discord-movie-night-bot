import {inject, injectable} from "inversify";
import DiscordController from "./DiscordController";
import ConfigController from "./ConfigController";
import GuildConfiguration from "../config/GuildConfiguration";
import {SlashCommandBuilder} from "@discordjs/builders";

@injectable()
export default class CommandController {

    commands: SlashCommandBuilder[] = []

    constructor(
        @inject(DiscordController) private discordController: DiscordController,
        @inject(ConfigController) private configController: ConfigController
    ) { }

    init() {
        this.initCommands()
        this.refreshCommands()
    }

    refreshCommands() {
        const guildConfigs: Record<string, GuildConfiguration> = this.configController.getConfig('guilds')

        if (guildConfigs) {
            for (const [id] of Object.entries(guildConfigs)) {
                this.discordController.refreshCommands(id, this.commands)
            }
        }
    }

    private initCommands() {
        const command = new SlashCommandBuilder()

        command
            .setName('movie-night')
            .setDescription('starts movie night in given days')
            .addIntegerOption(option => {
                return option.setName('in-hours')
                    .setDescription('movie night in hours from now')
                    .setRequired(false)
            })

        this.commands.push(command)

    }
}
