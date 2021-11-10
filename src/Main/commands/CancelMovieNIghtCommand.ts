import {inject, injectable} from "inversify";
import Command from "./Command";
import {CommandInteraction, Guild} from "discord.js";
import MovieNightController from "../control/MovieNightController";
import Logger from "../logger/Logger";
import {PermissionMode} from "../util/PermissionMode";

@injectable()
export default class CancelMovieNIghtCommand extends Command {

    constructor(
        @inject(MovieNightController) private movieNightController: MovieNightController,
        @inject(Logger) private logger: Logger
    ) {
        super()
        this.name = 'cancel-movie-night'
        this.description = 'this will cancle the' +
            ' currently planned movie night'
        this.mode = PermissionMode.ADMIN_ONLY
    }

    async run(interaction: CommandInteraction, guild: Guild): Promise<void> {
        try {
            await this.cancelMovieNightAndReply(interaction, guild)
        } catch (e) {
            await CancelMovieNIghtCommand.replyNoMoviesLeft(interaction)
        }
    }

    private deleteNextMovieNightOf(guild: Guild) {
        this.movieNightController.cancelNextMovieNight(
            guild.id,
            1
        )
    }

    private async cancelMovieNightAndReply(interaction: CommandInteraction, guild: Guild) {
        this.deleteNextMovieNightOf(guild)
        await interaction.reply('canceled next movie night')
    }

    private static async replyNoMoviesLeft(interaction: CommandInteraction) {
        await interaction.reply('no movie night left to cancel')
    }
}
