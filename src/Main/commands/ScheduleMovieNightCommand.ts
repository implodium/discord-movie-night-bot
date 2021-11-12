import Command from "./Command";
import Option from './Option'
import {CommandInteraction, Guild} from "discord.js";
import {inject, injectable} from "inversify";
import {PermissionMode} from "../util/PermissionMode";
import MovieNightController from "../control/MovieNightController";
import ConfigController from "../control/ConfigController";
import Logger from "../logger/Logger";
import ScheduleMovieNightExecution from "./execution/ScheduleMovieNightExecution";

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

    async run(interaction: CommandInteraction, guild: Guild): Promise<void> {
        const execution = new ScheduleMovieNightExecution(
            interaction,
            guild,
            this.configController,
            this.movieNightController
        )

        await execution.run()
        this.executions.push(execution)
    }
}
