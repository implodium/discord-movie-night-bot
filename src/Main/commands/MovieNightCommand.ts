import Command from "./Command";
import Option from './Option'
import {CommandInteraction} from "discord.js";

export default class MovieNightCommand extends Command {

    constructor() {
        super('movie-night', 'starts movie night in given days')
        this.addIntOption(new Option<number>(
            'in-days',
            'movie night in hours from now',
            false,
            0
        ))
    }

    async exec(interaction: CommandInteraction): Promise<void> {
        const inDays = interaction.options.getInteger('in-days')
        await interaction.reply(`${inDays}`)
    }

}
