import Announcement from "./Announcement";
import {MessageEmbed} from "discord.js";

export default class MovieNightReminderAnnouncements implements Announcement{

    titleDefault?: string
    descriptionDefault?: string
    descriptionThisWeek?: string
    movieUndetermined?: string
    reactions?: Record<string, string>

    get description(): string {
        return "";
    }

    get title(): string {
        return ""
    }

    get embed(): MessageEmbed {
        return new MessageEmbed()
    }
}
