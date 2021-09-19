import Announcement from "./Announcement";
import {MessageEmbed} from "discord.js";

export default class FinalMovieNightAnnouncement implements Announcement{

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
