import Announcement from "./Announcement";
import {MessageEmbed} from "discord.js";

export default class MovieNight implements Announcement{

    titleDefault?: string
    descriptionDefault?: string
    descriptionThisWeek?: string
    movieUndetermined?: string
    reactions?: Record<string, string>
    date?: Date
    isDetermined?: boolean;
    isThisWeek?: boolean;

    get description(): string {
        return "";
    }

    get title(): string {
        return ""
    }

    get embed(): MessageEmbed {
        return new MessageEmbed()
    }

    get weekDay(): string | undefined {
        if (this.date) {
            return this.date.toLocaleDateString('en-us', {weekday: "long"})
        } else {
            return undefined
        }
    }

    someOtherFunction() {
        console.log("Hello World")
    }


    public input(date: Date, isDetermined: boolean, isThisWeek: boolean): void {
        this.date = date
        this.isDetermined = isDetermined
        this.isThisWeek = isThisWeek
    }
}
