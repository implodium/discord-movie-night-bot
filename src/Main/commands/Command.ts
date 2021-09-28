import Option from "./Option";
import {CommandInteraction} from "discord.js";

export default abstract class Command {

    name: string
    description: string
    intOptions: Option<number>[]

    protected constructor(name: string, description: string) {
        this.name = name
        this.description = description
        this.intOptions = []
    }

    public abstract exec(interaction: CommandInteraction): Promise<void>

    addIntOption(option: Option<number>) {
        this.intOptions.push(option)
    }
}
