import {VoteDisplayType} from "../util/VoteDisplayType";
import AnnouncementConfiguration from "./AnnouncementConfiguration";
import EventConfig from "./EventConfig";

export default interface GuildConfiguration {
    adminRoleId?: string;
    votingDisplayTypes?: [VoteDisplayType];
    id?: string,
    votingChannelId?: string,
    errChannel?: string
    winningChannelId?: string
    winningMessageId?: string,
    announcementChannelId?: string
    announcements?: AnnouncementConfiguration
    cinemaChannelId?: string,
    events: [EventConfig]
}
