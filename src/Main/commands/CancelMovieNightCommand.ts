import {inject, injectable} from "inversify";
import Command from "./Command";
import {CommandInteraction, Guild} from "discord.js";
import MovieNightController from "../control/MovieNightController";
import {PermissionMode} from "../util/PermissionMode";
import CancelMovieNightExecution from "./execution/CancelMovieNightExecution";

@injectable()
export default class CancelMovieNightCommand extends Command {

    constructor(
        @inject(MovieNightController) private movieNightController: MovieNightController
    ) {
        super()
        this.name = 'cancel-movie-night'
        this.description = 'this will cancle the' +
            ' currently planned movie night'
        this.mode = PermissionMode.ADMIN_ONLY
    }

    async run(interaction: CommandInteraction, guild: Guild): Promise<void> {
        const execution = new CancelMovieNightExecution(
            interaction,
            guild,
            this.movieNightController,
        )

        await execution.run()
        this.executions.push(execution)
    }
}