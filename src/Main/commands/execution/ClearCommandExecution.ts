import Execution from "./Execution";
import ConfigController from "../../control/ConfigController";
import StorageController from "../../control/StorageController";
import {CommandInteraction, Guild} from "discord.js";
import VotingController from "../../control/VotingController";
import GuildConfiguration from "../../config/GuildConfiguration";

export default class ClearCommandExecution extends Execution {

    private readonly clearingStorageReply = 'clearing storage'
    private readonly updatingBotReply = 'updating bot'
    private readonly storageClearedReply = 'storage cleared'
    private config: GuildConfiguration

    constructor(
        private interaction: CommandInteraction,
        private guild: Guild,
        private configController: ConfigController,
        private storageController: StorageController,
        private votingController: VotingController
    ) {
        super()
        this.config = this.configController.getConfigurationByGuildId(this.guild.id)
    }

    async run(): Promise<void> {
        await this.clearStorage()
        await this.updateBot()
        await this.finish()
    }

    private async clearStorage(): Promise<void> {
        await this.interaction.reply(this.clearingStorageReply)
        await this.storageController.clearGuildStorage(this.guild.id)
    }

    private async updateBot(): Promise<void> {
        await this.interaction.editReply(this.updatingBotReply)
        await this.votingController.initGuild(this.config)
    }

    private async finish(): Promise<void> {
        await this.interaction.editReply(this.storageClearedReply)
    }
}
