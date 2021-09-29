import Command from "./Command";
import Option from './Option'
import {CommandInteraction} from "discord.js";
import {inject, injectable} from "inversify";
import {PermissionMode} from "../util/PermissionMode";
import ConfigController from "../control/ConfigController";

@injectable()
export default class MovieNightCommand extends Command {

    constructor(
        @inject(ConfigController) private configController: ConfigController
    ) {
        super()
        this.name = 'movie-night'
        this.description = 'starts movie night'
        this.mode = PermissionMode.WHITELIST

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
