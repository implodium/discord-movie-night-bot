import {inject, injectable} from "inversify";
import Command from "./Command";
import {CommandInteraction, MessageEmbed} from "discord.js";
import MovieNightController from "../control/MovieNightController";
import InternalError from "../error/InternalError";
import DateUtil from "../util/DateUtil";
import {PermissionMode} from "../util/PermissionMode";

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

    async exec(interaction: CommandInteraction): Promise<void> {
        if (interaction.guildId) {
            const sortedMovieNights = this.movieNightController.sortMovieNights(interaction.guildId)
            const messageEmbed = new MessageEmbed()
                .setTitle('Upcoming movie nights')
                .setDescription('The following are the iupcoming movie nights')

            sortedMovieNights.forEach((sortedMovieNight, index) => {
                const dateString = this.dateUtil.getDateStringOf(sortedMovieNight.date)
                messageEmbed.addField((index + 1).toString(), dateString)
            })

            await interaction.reply({embeds: [messageEmbed]})
        } else {
            throw new InternalError('command shoul only be used in a guild')
        }
        return Promise.resolve(undefined);
    }
}
