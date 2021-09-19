import Announcement from "./Announcement";
import {MessageEmbed} from "discord.js";

export default class MovieNightReminderAnnouncements implements Announcement{

    titleDefault?: string
    descriptionDefault?: string
    descriptionThisWeek?: string
    movieUndetermined?: string
    reactions?: Record<string, string>
    day?: number
    date?: Date

    get description(): string {
        return "";
    }

    get title(): string {
        return ""
    }

    get embed(): MessageEmbed {
        return new MessageEmbed()
    }

    setInfo(day: number, date: Date) {
        this.day = day
        this.date = date
    }
}
