import {MessageEmbed} from "discord.js";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";

export default interface AnnouncementBuilder<AnnouncementType> {
    build(
        announcement: AnnouncementType,
        announcementConfig: AnnouncementConfiguration,
        movieNightDate: Date
    ): Promise<MessageEmbed>
}
