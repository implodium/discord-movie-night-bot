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

    async exec(interaction: CommandInteraction): Promise<void> {
        if (interaction.guildId) {
            const scheduledGuildMovies = this.movieNightController
                .schedulesMovieNights
                .get(interaction.guildId)

            if (scheduledGuildMovies) {
                const canceledMovieNight = scheduledGuildMovies.pop()
                if (canceledMovieNight) {
                    canceledMovieNight.movieNightJob.cancel()
                    canceledMovieNight.movieNightStartJob.cancel()
                    canceledMovieNight.movieNightFinalDecisionJob.cancel()

                    const canceledMovieNightDate = canceledMovieNight.date.toLocaleDateString('de-DE')
                    const canceledMovieNightTime = canceledMovieNight.date.toLocaleTimeString('de-DE', {
                        hour: 'numeric',
                        minute: 'numeric'
                    })
                    const canceledMovieNightDateTime = `${canceledMovieNightDate} ${canceledMovieNightTime}`
                    await interaction.reply(`canceled movie night scheduled on ${canceledMovieNightDateTime}`)
                } else {
                    await interaction.reply('there is no movieNight to cancel')
                }
            } else {
                await interaction.reply(
                    'something went wrong pease ask ' +
                    'someone to check the logs or check them yourself'
                )
                this.logger.error('scheduled guild movies has not been initialized')
                this.logger.error('the cause of this could be that the guild itself is not initialized')
            }
        } else {
            await interaction.reply('this command only works in guilds')
            this.logger.error('this command only works in guilds')
        }
    }
}
