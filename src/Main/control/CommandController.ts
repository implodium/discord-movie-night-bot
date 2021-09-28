import {inject, injectable} from "inversify";
import DiscordController from "./DiscordController";
import ConfigController from "./ConfigController";
import GuildConfiguration from "../config/GuildConfiguration";
import {SlashCommandBuilder} from "@discordjs/builders";
import Command from "../commands/Command";
import MovieNightCommand from "../commands/MovieNightCommand";

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
        const command = new MovieNightCommand()
        this.initCommand(command)
    }

    private initCommand(command: Command) {
        const builder = new SlashCommandBuilder()

        builder
            .setName(command.name)
            .setDescription(command.description)

        for (const option of command.intOptions) {
            builder
                .addIntegerOption(optionProtocol => {
                    return optionProtocol
                        .setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.isRequired)
                })
        }

        this.discordController.client.on('interactionCreate', interaction => {
            if (interaction.isCommand()
                && interaction.commandName === command.name
            ) {
                command.exec(interaction)
            }
        })

        this.commands.push(builder)
    }
}
