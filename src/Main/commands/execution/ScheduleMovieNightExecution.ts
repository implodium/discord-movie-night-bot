import Execution from "./Execution";
import {CommandInteraction, Guild} from "discord.js";
import ConfigController from "../../control/ConfigController";
import MovieNightController from "../../control/MovieNightController";
import GuildConfiguration from "../../config/GuildConfiguration";

export default class ScheduleMovieNightExecution extends Execution{

    private readonly inputDate: Date
    private readonly config: GuildConfiguration
    private readonly finishReply = 'movie night scheduled'

    constructor(
        private readonly interaction: CommandInteraction,
        private readonly guild: Guild,
        private readonly configController: ConfigController,
        private readonly movieNightController: MovieNightController
    ) {
        super();
        this.config = this.getConfig()
        this.inputDate = this.getInputDate()
    }

    async run(): Promise<void> {
        await this.startMovieNight()
        await this.reply()
    }

    private getConfig() {
        return this.configController.getConfigurationByGuildId(this.guild.id)
    }

    private getInputDate() {
        const options = this.interaction.options

        return new Date(
            options.getInteger('year')!,
            options.getInteger('month')! - 1,
            options.getInteger('day')!,
            options.getInteger('hour')!,
            options.getInteger('minute')!
        )
    }

    private async startMovieNight() {
        await this.movieNightController.startMovieNight(
            this.inputDate,
            this.config
        )
    }

    private async reply() {
        await this.interaction.reply(this.finishReply)
    }
}
