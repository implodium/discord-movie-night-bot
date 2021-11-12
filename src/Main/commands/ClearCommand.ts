import {inject, injectable} from "inversify";
import Command from "./Command";
import {CommandInteraction, Guild} from "discord.js";
import {PermissionMode} from "../util/PermissionMode";
import StorageController from "../control/StorageController";
import VotingController from "../control/VotingController";
import ConfigController from "../control/ConfigController";
import ClearCommandExecution from "./execution/ClearCommandExecution";

@injectable()
export default class ClearCommand extends Command {

    constructor(
        @inject(StorageController) private storageController: StorageController,
        @inject(VotingController) private votingController: VotingController,
        @inject(ConfigController) private configController: ConfigController,
    ) {
        super()
        this.name = "clear"
        this.description = "this command clears the storage for this guild"
        this.mode = PermissionMode.ADMIN_ONLY
    }

    async run(interaction: CommandInteraction, guild: Guild): Promise<void> {
        const execution = new ClearCommandExecution(
            interaction,
            guild,
            this.configController,
            this.storageController,
            this.votingController
        );

        await execution.run()
        this.executions.push(execution)
    }
}
