import {VoteDisplayType} from "../util/VoteDisplayType";

export default interface GuildConfiguration {
    id?: string,
    votingChannelId?: string,
    votingDisplayType?: [VoteDisplayType],
    errChannel?: string
    winningChannel?: string
}
