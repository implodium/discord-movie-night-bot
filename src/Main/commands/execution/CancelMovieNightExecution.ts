import Execution from "./Execution";
import {CommandInteraction, Guild} from "discord.js";
import MovieNightController from "../../control/MovieNightController";

export default class CancelMovieNightExecution extends Execution {

    private noMoviesLeftReply = 'no movie night left to cancel'
    private successMessage = 'canceled next movie night'

    constructor(
        private interaction: CommandInteraction,
        private guild: Guild,
        private movieNightController: MovieNightController
    ) {
        super();
    }

    async run(): Promise<void> {
        try {
            await this.cancelMovieNightAndReply()
        } catch (e) {
            await this.replyNoMoviesLeft()
        }
    }

    private deleteNextMovieNightOf() {
        this.movieNightController.cancelNextMovieNight(
            this.guild.id,
            1
        )
    }

    private async cancelMovieNightAndReply() {
        this.deleteNextMovieNightOf()
        await this.interaction.reply(this.successMessage)
    }

    private async replyNoMoviesLeft() {
        await this.interaction.reply(this.noMoviesLeftReply)
    }
}
