import {inject, injectable} from "inversify";
import Command from "./Command";
import {CommandInteraction, Guild} from "discord.js";
import MovieNightController from "../control/MovieNightController";
import DateUtil from "../util/DateUtil";
import {PermissionMode} from "../util/PermissionMode";
import ListMovieNightExecution from "./execution/ListMovieNightExecution";

@injectable()
export default class ListMovieNightCommand extends Command{

    executions: ListMovieNightExecution[] = []

    constructor(
        @inject(MovieNightController) private movieNightController: MovieNightController,
        @inject(DateUtil) private dateUtil: DateUtil
    ) {
        super();
        this.name = 'list-movie-nights'
        this.description = 'lists every scheduled movie night'
        this.mode = PermissionMode.ADMIN_ONLY
    }

    async run(interaction: CommandInteraction, guild: Guild): Promise<void> {
        const execution = new ListMovieNightExecution(
            interaction,
            guild,
            this.movieNightController,
            this.dateUtil
        )

        await execution.run()
        this.executions.push(execution)
    }
}
