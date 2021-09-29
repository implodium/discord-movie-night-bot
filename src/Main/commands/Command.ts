import Option from "./Option";
import {CommandInteraction} from "discord.js";
import {PermissionMode} from "../util/PermissionMode";
import {injectable} from "inversify";

@injectable()
export default abstract class Command {

    name?: string
    description?: string
    intOptions: Option<number>[] = []
    mode: PermissionMode = PermissionMode.BLACKLIST
    listedRoles: string[] = []

    public abstract exec(interaction: CommandInteraction): Promise<void>

    addIntOption(... option: Option<number>[]): Command {
        this.intOptions.push(... option)
        return this
    }

    addRoles(... roleIds: string[]): Command {
        this.listedRoles.push(... roleIds)
        return this
    }
}
