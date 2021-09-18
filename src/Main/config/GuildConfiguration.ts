import {VoteDisplayType} from "../util/VoteDisplayType";

export default interface GuildConfiguration {
    votingDisplayTypes?: [VoteDisplayType];
    id?: string,
    votingChannelId?: string,
    errChannel?: string
    winningChannelId?: string
    winningMessageId?: string
}
