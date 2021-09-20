import {inject, injectable} from "inversify";
import MovieNight from "../util/announcements/MovieNight";
import MovieNightFinalDecision from "../util/announcements/MovieNightFinalDecision";
import MovieNightStart from "../util/announcements/MovieNightStart";
import Logger from "../logger/Logger";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import {MessageEmbed} from "discord.js";
import InternalError from "../error/InternalError";
import DateUtil from "../util/DateUtil";

@injectable()
export default class AnnouncementBuilderController {

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(DateUtil) private dateUtil: DateUtil
    ) {
    }


    buildMovieNight(
        announcement: MovieNight,
        announcementConfig: AnnouncementConfiguration
    ): Promise<MessageEmbed> {
        return new Promise((resolve, reject) => {
            this.getDate(announcementConfig)
                .then(date => {
                    date.setDate(date.getDate() + 10)
                    this.logger.info("building movie night announcement")
                    let title = ""
                    let description = ""

                    if (announcement.titleDefault) {
                        title = announcement.titleDefault.replace(
                            '$date', date.toLocaleDateString(
                                'de-DE'
                            )
                        )
                        this.logger.debug(title);
                    } else {
                        reject(new InternalError('default title not set'))
                    }

                    if (announcement.descriptionDefault && announcement.descriptionThisWeek) {
                        if (!this.dateUtil.isThisWeek(date)) {
                            const dayAmount = this.dateUtil.getDaysUntil(date)
                            description = announcement.descriptionDefault.replace('$dayAmount', dayAmount.toString())
                            this.logger.debug(description)
                        } else {
                            const weekDay = this.dateUtil.getWeekDay(date)
                            description = announcement.descriptionThisWeek.replace("$weekDay", weekDay)
                            this.logger.debug(description)
                        }
                        this.logger.debug(date)
                    }
                })
        })
    }

    buildMovieNightFinalDecision(
        announcement: MovieNightFinalDecision,
        announcementConfiguration: AnnouncementConfiguration
    ): Promise<MessageEmbed> {
        return new Promise((resolve, reject) => {
            this.logger.warn('not implemented yet')
        })
    }

    buildMovieNightStart(
        announcement: MovieNightStart,
        announcementConfiguration: AnnouncementConfiguration
    ): Promise<MessageEmbed> {
        return new Promise((resolve, reject) => {
            this.logger.warn('not implemented yet')
        })
    }

    private getDate(config: AnnouncementConfiguration): Promise<Date> {
        return new Promise((resolve, reject) => {
            const date = new Date()
            switch (config.every) {
                case 'week':
                    if (config.everyCount && config.day) {
                        date.setDate(date.getDate() + (config.day + (7 - date.getDay())) % 7)
                        resolve(date)
                    } else {
                        reject(new InternalError('No every count configured'))
                    }
                    break
                default:
                    reject(new InternalError('Configuration property does not exist'))
            }

            resolve(new Date())
        })
    }
}
