import Command from "./Command";
import Option from './Option'
import {CommandInteraction, CommandInteractionOptionResolver} from "discord.js";
import {inject, injectable} from "inversify";
import {PermissionMode} from "../util/PermissionMode";
import MovieNightController from "../control/MovieNightController";
import ConfigController from "../control/ConfigController";
import GuildConfigurations from "../config/GuildConfigurations";
import Logger from "../logger/Logger";

@injectable()
export default class ScheduleMovieNightCommand extends Command {

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(MovieNightController) private movieNightController: MovieNightController,
        @inject(ConfigController) private configController: ConfigController
    ) {
        super()
        this.name = 'schedule-movie-night'
        this.description = 'starts movie night'
        this.mode = PermissionMode.ADMIN_ONLY

        this.addRequiredIntOption(
            'day',
            'day value of the date',
        )

        this.addRequiredIntOption(
            'month',
            'month value of the date',
        )

        this.addRequiredIntOption(
            'year',
            'year value of the date'
        )

        this.addRequiredIntOption(
            'hour',
            'hour value of the date'
        )

        this.addRequiredIntOption(
            'minute',
            'minute value of the date'
        )
    }

    async exec(interaction: CommandInteraction): Promise<void> {
        const date = ScheduleMovieNightCommand.getDateFrom(interaction.options)
        const guildConfigs: GuildConfigurations = this.configController.getConfig('guilds')

        this.logger.debug(date)

        if (interaction.guild && guildConfigs[interaction.guild.id]) {
            await this.movieNightController.startMovieNight(
                date,
                guildConfigs[interaction.guild.id]
            )

            await interaction.reply("movie night scheduled")
        }
    }

    addRequiredIntOption(name: string, description: string): void {
        this.addIntOption(new Option<number>(
            name,
            description,
            true
        ))
    }

    private static getDateFrom(options: CommandInteractionOptionResolver) {
        // (!) because values are required
        return new Date(
            options.getInteger('year')!,
            options.getInteger('month')! - 1,
            options.getInteger('day')!,
            options.getInteger('hour')!,
            options.getInteger('minute')!
        )
    }
}
