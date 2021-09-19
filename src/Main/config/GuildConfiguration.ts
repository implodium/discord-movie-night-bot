import {VoteDisplayType} from "../util/VoteDisplayType";
import AnnouncementConfiguration from "./AnnouncementConfiguration";

export default interface GuildConfiguration {
    votingDisplayTypes?: [VoteDisplayType];
    id?: string,
    votingChannelId?: string,
    errChannel?: string
    winningChannelId?: string
    winningMessageId?: string,
    announcementChannelId?: string
    announcements?: AnnouncementConfiguration
}
