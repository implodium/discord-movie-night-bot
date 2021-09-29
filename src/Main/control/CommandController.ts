import {inject, injectable} from "inversify";
import DiscordController from "./DiscordController";
import ConfigController from "./ConfigController";
import {SlashCommandBuilder} from "@discordjs/builders";
import Command from "../commands/Command";
import MovieNightCommand from "../commands/MovieNightCommand";
import {ApplicationCommand} from "discord.js";
import Logger from "../logger/Logger";
import GuildConfigurations from "../config/GuildConfigurations";
import {PermissionMode} from "../util/PermissionMode";

@injectable()
export default class CommandController {

    commands: SlashCommandBuilder[] = []

    constructor(
        @inject(DiscordController) private discordController: DiscordController,
        @inject(ConfigController) private configController: ConfigController,
        @inject(MovieNightCommand) private movieNightCommand: MovieNightCommand,
        @inject(Logger) private logger: Logger
    ) { }

    async init() {
        this.initCommand(this.movieNightCommand)
    }

    private buildCommand(command: Command): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()

        if (command.name && command.description) {
            builder
                .setName(command.name)
                .setDescription(command.description)
        }

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

        return builder
    }

    private async initCommand(command: Command) {
        const guildConfigs: GuildConfigurations = this.configController.getConfig("guilds")
        const builder = this.buildCommand(command)

        for (const [id, guildConfig] of Object.entries(guildConfigs)) {
            await this.refreshCommand(id, builder, command)
        }
    }

    private async refreshCommand(guildId: string, builder: SlashCommandBuilder, commnad: Command): Promise<ApplicationCommand[]> {
        return await this.discordController
            .refreshCommands(guildId, [builder])
    }
}
