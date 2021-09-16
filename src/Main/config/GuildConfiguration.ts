import {VoteDisplayType} from "../util/VoteDisplayType";

export default interface GuildConfiguration {
    votingDisplayTypes?: [VoteDisplayType];
    id?: string,
    votingChannelId?: string,
    errChannel?: string
    winningChannel?: string
}
