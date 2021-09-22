import AnnouncementBuilder from "./AnnouncementBuilder";
import MovieNight from "../util/announcements/MovieNight";
import {MessageEmbed} from "discord.js";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import InternalError from "../error/InternalError";
import {inject, injectable} from "inversify";
import Logger from "../logger/Logger";
import DateUtil from "../util/DateUtil";

@injectable()
export default class MovieNightBuilder implements AnnouncementBuilder<MovieNight> {

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(DateUtil) private dateUtil: DateUtil
    ) { }

    async build(
        announcement: MovieNight,
        announcementConfig: AnnouncementConfiguration,
        movieNightDate: Date
    ): Promise<MessageEmbed> {
        this.logger.info("building movie night announcement")
        const title = await this.getTitle(announcement, movieNightDate)
        const description = await this.getDescription(announcement, movieNightDate)

        return new MessageEmbed()
            .setTitle(title)
            .setColor('RED')
            .setDescription(description)
    }

    private getTitle(announcement: MovieNight, date: Date): Promise<string> {
        return new Promise((resolve, reject) => {
            if (announcement.titleDefault) {
                const title = announcement.titleDefault.replace(
                    '$date', date.toLocaleDateString(
                        'de-DE'
                    )
                )
                resolve(title)
            } else {
                reject(new InternalError('default title not set'))
            }
        })
    }

    private getDescription(announcement: MovieNight, date: Date): Promise<string> {
        return new Promise((resolve, reject) => {
            if (announcement.descriptionDefault && announcement.descriptionThisWeek) {
                if (!this.dateUtil.isThisWeek(date)) {
                    const dayAmount = this.dateUtil.getDaysUntil(date)
                    resolve(announcement.descriptionDefault.replace('$dayAmount', dayAmount.toString()))
                } else {
                    const weekDay = this.dateUtil.getWeekDay(date)
                    resolve(announcement.descriptionThisWeek.replace("$weekDay", weekDay))
                }
            } else {
                reject(new InternalError("description " +
                    "configurations not set for " +
                    "announcement movieNight"))
            }
        })
    }
}
