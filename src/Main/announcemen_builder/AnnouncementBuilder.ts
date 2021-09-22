import {MessageEmbed} from "discord.js";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import Announcement from "../util/announcements/Announcement";

export default interface AnnouncementBuilder {
    build(
        announcement: Announcement,
        announcementConfig: AnnouncementConfiguration,
        movieNightDate: Date
    ): Promise<MessageEmbed>
}
