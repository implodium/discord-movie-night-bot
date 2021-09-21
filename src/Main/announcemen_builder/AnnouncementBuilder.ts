import {MessageEmbed} from "discord.js";
import MovieNight from "../util/announcements/MovieNight";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";

export default interface AnnouncementBuilder {
    build(
        announcement: MovieNight,
        announcementConfig: AnnouncementConfiguration,
        movieNightDate: Date
    ): Promise<MessageEmbed>
}
