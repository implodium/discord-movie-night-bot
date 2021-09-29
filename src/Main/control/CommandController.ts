import {inject, injectable} from "inversify";
import DiscordController from "./DiscordController";
import ConfigController from "./ConfigController";
import {SlashCommandBuilder} from "@discordjs/builders";
import Command from "../commands/Command";
import MovieNightCommand from "../commands/MovieNightCommand";
import {ApplicationCommand, CommandInteraction} from "discord.js";
import Logger from "../logger/Logger";
import GuildConfigurations from "../config/GuildConfigurations";
import {PermissionMode} from "../util/PermissionMode";
import GuildConfiguration from "../config/GuildConfiguration";

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

    private buildCommand(command: Command, guildConfig: GuildConfiguration): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()

        if (guildConfig.adminRoleId) {
            command.addRoles(guildConfig.adminRoleId)
        }

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

        this.discordController.client.on('interactionCreate', async interaction => {
            if (interaction.isCommand()
                && interaction.commandName === command.name
            ) {
                const commandInteraction = interaction as CommandInteraction
                if (command.mode === PermissionMode.WHITELIST) {
                    const user = commandInteraction.user

                    if (interaction.guild) {
                        const commandRoles = command.listedRoles
                        const guildMember = await interaction.guild
                            .members
                            .fetch(user.id)
                        const userRoles = guildMember.roles.valueOf()
                        const intersection = userRoles.filter(role => commandRoles.includes(role.id))

                        commandRoles.forEach(roleId => this.logger.debug(roleId))
                        if (intersection.size > 0) {
                            await command.exec(interaction)
                        } else {
                            await interaction.reply(
                                'only one with permission ' +
                                'may use this command'
                            )
                        }
                    }
                }
            }
        })

        return builder
    }

    private async initCommand(command: Command) {
        const guildConfigs: GuildConfigurations = this.configController.getConfig("guilds")

        for (const [id, guildConfig] of Object.entries(guildConfigs)) {
            const builder = this.buildCommand(command, guildConfig)
            await this.refreshCommand(id, builder)
        }
    }

    private async refreshCommand(guildId: string, builder: SlashCommandBuilder): Promise<ApplicationCommand[]> {
        return await this.discordController
            .refreshCommands(guildId, [builder])
    }
}
