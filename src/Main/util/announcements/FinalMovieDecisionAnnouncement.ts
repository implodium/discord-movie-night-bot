import Announcement from "./Announcement";
import {MessageEmbed} from "discord.js";

export default class FinalMovieDecisionAnnouncement implements Announcement {

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
