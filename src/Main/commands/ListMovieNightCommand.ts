import {inject, injectable} from "inversify";
import Command from "./Command";
import {CommandInteraction, Guild, MessageEmbed} from "discord.js";
import MovieNightController from "../control/MovieNightController";
import InternalError from "../error/InternalError";
import DateUtil from "../util/DateUtil";
import {PermissionMode} from "../util/PermissionMode";
import ListMovieNightResponseBuilder from "../util/ListMovieNightResponseBuilder";

@injectable()
export default class ListMovieNightCommand extends Command{

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
        const sortedMovieNights = this.movieNightController.getSortMovieNights(guild.id)
        const messageBuilder = new ListMovieNightResponseBuilder(sortedMovieNights, this.dateUtil)
        const messageEmbed = messageBuilder.build()
        await interaction.reply({embeds: [messageEmbed]})
    }
}
