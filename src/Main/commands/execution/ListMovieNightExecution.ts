import {CommandInteraction, Guild} from "discord.js";
import Execution from "./Execution";
import ListMovieNightResponseBuilder from "../../util/ListMovieNightResponseBuilder";
import MovieNightController from "../../control/MovieNightController";
import DateUtil from "../../util/DateUtil";

export default class ListMovieNightExecution extends Execution{

    constructor(
        private interaction: CommandInteraction,
        private guild: Guild,
        private movieNightController: MovieNightController,
        private dateUtil: DateUtil
    ) {
        super()
    }

    async run(): Promise<void> {
        const sortedMovieNights = this.movieNightController.getSortMovieNights(this.guild.id)
        const messageBuilder = new ListMovieNightResponseBuilder(sortedMovieNights, this.dateUtil)
        const messageEmbed = messageBuilder.build()
        await this.interaction.reply({embeds: [messageEmbed]})
    }
}
