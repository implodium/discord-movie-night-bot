import {inject, injectable} from "inversify";
import Command from "./Command";
import {CommandInteraction} from "discord.js";
import {PermissionMode} from "../util/PermissionMode";
import StorageController from "../control/StorageController";
import VotingController from "../control/VotingController";
import ConfigController from "../control/ConfigController";

@injectable()
export default class ClearCommand extends Command {

    constructor(
        @inject(StorageController) private storageController: StorageController,
        @inject(VotingController) private votingController: VotingController,
        @inject(ConfigController) private configController: ConfigController
    ) {
        super()
        this.name = "clear"
        this.description = "this command clears the storage for this guild"
        this.mode = PermissionMode.ADMIN_ONLY
    }

    async run(interaction: CommandInteraction): Promise<void> {
        if (interaction.guildId) {
            await interaction.reply("clearing storage")
            const config = this.configController.getConfigurationByGuildId(interaction.guildId)
            await this.storageController.clearGuildStorage(interaction.guildId)
            await interaction.editReply("updating bot")
            await this.votingController.initGuild(config)
            await interaction.editReply("storage cleared")
        }
    }
}
