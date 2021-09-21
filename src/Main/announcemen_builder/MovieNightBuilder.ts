import AnnouncementBuilder from "./AnnouncementBuilder";
import MovieNight from "../util/announcements/MovieNight";
import {MessageEmbed} from "discord.js";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import InternalError from "../error/InternalError";
import {inject, injectable} from "inversify";
import Logger from "../logger/Logger";
import DateUtil from "../util/DateUtil";

@injectable()
export default class MovieNightBuilder implements AnnouncementBuilder{

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(DateUtil) private dateUtil: DateUtil
    ) { }

    build(
        announcement: MovieNight,
        announcementConfig: AnnouncementConfiguration,
        movieNightDate: Date
    ): Promise<MessageEmbed> {
        return new Promise((resolve, reject) => {
            this.logger.info("building movie night announcement")
            let title = ""
            let description = ""

            if (announcement.titleDefault) {
                title = announcement.titleDefault.replace(
                    '$date', movieNightDate.toLocaleDateString(
                        'de-DE'
                    )
                )
                this.logger.debug(title);
            } else {
                reject(new InternalError('default title not set'))
            }

            if (announcement.descriptionDefault && announcement.descriptionThisWeek) {
                if (!this.dateUtil.isThisWeek(movieNightDate)) {
                    const dayAmount = this.dateUtil.getDaysUntil(movieNightDate)
                    description = announcement.descriptionDefault.replace('$dayAmount', dayAmount.toString())
                    this.logger.debug(description)
                } else {
                    const weekDay = this.dateUtil.getWeekDay(movieNightDate)
                    description = announcement.descriptionThisWeek.replace("$weekDay", weekDay)
                    this.logger.debug(description)
                }
                this.logger.debug(movieNightDate)
            }
        })
    }

}
