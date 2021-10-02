import {inject, injectable} from "inversify";
import DiscordController from "./DiscordController";
import ConfigController from "./ConfigController";
import {SlashCommandBuilder} from "@discordjs/builders";
import Command from "../commands/Command";
import ScheduleMovieNightCommand from "../commands/ScheduleMovieNightCommand";
import {ApplicationCommand, CommandInteraction} from "discord.js";
import Logger from "../logger/Logger";
import GuildConfigurations from "../config/GuildConfigurations";
import {PermissionMode} from "../util/PermissionMode";
import GuildConfiguration from "../config/GuildConfiguration";
import InternalError from "../error/InternalError";
import CancelMovieNIghtCommand from "../commands/CancelMovieNIghtCommand";

@injectable()
export default class CommandController {

    commandBuilders: SlashCommandBuilder[] = []

    constructor(
        @inject(DiscordController) private discordController: DiscordController,
        @inject(ConfigController) private configController: ConfigController,
        @inject(ScheduleMovieNightCommand) private scheduleMovieNightCommand: ScheduleMovieNightCommand,
        @inject(CancelMovieNIghtCommand) private cancelMovieNightCommand: CancelMovieNIghtCommand,
        @inject(Logger) private logger: Logger
    ) { }

    async init() {
        const commandInit = Promise.all([
            this.initCommand(this.scheduleMovieNightCommand),
            this.initCommand(this.cancelMovieNightCommand)
        ])

        await commandInit
        this.logger.info('command initialized')
    }

    private async initCommand(command: Command) {
        const guildConfigs: GuildConfigurations = this.configController.getConfig("guilds")
        this.buildCommand(command)

        for (const [id, guildConfig] of Object.entries(guildConfigs)) {
            await this.addInteraction(command, guildConfig)
            await this.refreshCommand(id)
        }
    }

    private buildCommand(command: Command): SlashCommandBuilder {
        const builder = new SlashCommandBuilder()

        if (command.name && command.description) {
            builder
                .setName(command.name)
                .setDescription(command.description)

            this.buildOptions(command, builder)
        }

        this.commandBuilders.push(builder)
        return builder
    }

    private buildOptions(command: Command, builder: SlashCommandBuilder) {
        for (const option of command.intOptions) {
            builder
                .addIntegerOption(optionProtocol => {
                    return optionProtocol
                        .setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.isRequired)
                })
        }
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

    private async isPermittedFor(
        command: Command,
        guildConfig: GuildConfiguration,
        interaction: CommandInteraction
    ): Promise<boolean> {
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

    private async checkAdminOnlyPermission(
        guildConfig: GuildConfiguration,
        interaction: CommandInteraction
    ): Promise<boolean> {
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

    private async checkWhiteListPermission(
        interaction: CommandInteraction,
        command: Command
    ): Promise<boolean> {
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

    private async refreshCommand(
        guildId: string
    ): Promise<ApplicationCommand[]> {
        return await this.discordController
            .refreshCommands(guildId, this.commandBuilders)
    }

}
