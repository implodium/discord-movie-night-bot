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
import InternalError from "../error/InternalError";

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

        return builder
    }

    private async isPermittedFor(command: Command, guildConfig: GuildConfiguration, interaction: CommandInteraction): Promise<boolean> {
        if (interaction.guild) {
            switch (command.mode) {
                case PermissionMode.ADMIN_ONLY:
                    return this.checkAdminOnlyPermission(guildConfig, interaction)
                case PermissionMode.WHITELIST:
                    return this.checkWhiteListPermission(interaction, command)
                default:
                    throw new InternalError('permission mode does not exist')
            }
        } else {
            throw new InternalError('Command should only be executed in a guild')
        }
    }

    private async checkAdminOnlyPermission(guildConfig: GuildConfiguration, interaction: CommandInteraction): Promise<boolean> {
        if (interaction.guild) {
            const member = await interaction.guild.members.fetch(interaction.user.id)
            const highestMemberRole = member.roles.highest
            const adminRoleId = guildConfig.adminRoleId

            if (adminRoleId) {
                const adminRole = await interaction.guild.roles.fetch(adminRoleId)
                if (adminRole) {
                    this.logger.debug(adminRole.comparePositionTo(highestMemberRole))
                    return highestMemberRole.comparePositionTo(adminRole) >= 0
                } else {
                    throw new InternalError("given admin role id appears to be invalid")
                }
            } else {
                throw new InternalError('admin role was not configured')
            }
        } else {
            throw new InternalError('Command should only be executed in a guild')
        }
    }

    private async checkWhiteListPermission(interaction: CommandInteraction, command: Command): Promise<boolean> {
        if (interaction.guild) {
            const user = interaction.user

            const commandRoles = command.listedRoles
            const guildMember = await interaction.guild
                .members
                .fetch(user.id)
            const userRoles = guildMember.roles.valueOf()
            const intersection = userRoles.filter(role => commandRoles.includes(role.id))

            return intersection.size > 0
        } else {
            throw new InternalError('Command should only be executed in a guild')
        }
    }

    private async initCommand(command: Command) {
        const guildConfigs: GuildConfigurations = this.configController.getConfig("guilds")
        const builder = this.buildCommand(command)

        for (const [id, guildConfig] of Object.entries(guildConfigs)) {
            await this.addInteraction(command, guildConfig)
            await this.refreshCommand(id, builder)
        }
    }

    private async refreshCommand(guildId: string, builder: SlashCommandBuilder): Promise<ApplicationCommand[]> {
        return await this.discordController
            .refreshCommands(guildId, [builder])
    }

    private async addInteraction(command: Command, guildConfig: GuildConfiguration) {
        this.discordController.client.on('interactionCreate', async interaction => {
            if (interaction.isCommand()
                && interaction.commandName === command.name
            ) {
                if (await this.isPermittedFor(command, guildConfig, interaction)) {
                    await command.exec(interaction)
                } else {
                    await interaction.reply('You dont have the permission for this command')
                }
            }
        })

    }
}
