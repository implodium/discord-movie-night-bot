import {inject, injectable} from "inversify";
import Command from "./Command";
import {CommandInteraction} from "discord.js";
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

    async run(interaction: CommandInteraction): Promise<void> {
        if (interaction.guildId) {
            try {
                this.movieNightController.cancelNextMovieNight(
                    interaction.guildId,
                    1
                )

                await interaction.reply('canceled next movie night')
            } catch (e) {
                this.logger.error(e)
                await interaction.reply('no movie night left to cancel')
            }
        }
    }
}
