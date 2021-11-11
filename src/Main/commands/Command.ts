import Option from "./Option";
import {CommandInteraction, Guild} from "discord.js";
import {PermissionMode} from "../util/PermissionMode";
import {injectable} from "inversify";
import InternalError from "../error/InternalError";
import Execution from "./execution/Execution";

@injectable()
export default abstract class Command {

    name?: string
    description?: string
    intOptions: Option<number>[] = []
    mode: PermissionMode = PermissionMode.BLACKLIST
    listedRoles: string[] = []
    executions: Execution[] = []

    public async exec(interaction: CommandInteraction): Promise<void> {
        if (interaction.guild) {
            await this.run(interaction, interaction.guild)
        } else {
            throw new InternalError('command should only be used in a guild')
        }
    }

    public abstract run(interaction: CommandInteraction, guild: Guild): Promise<void>

    addIntOption(... option: Option<number>[]): Command {
        this.intOptions.push(... option)
        return this
    }

    addRoles(... roleIds: string[]): Command {
        this.listedRoles.push(... roleIds)
        return this
    }
}
