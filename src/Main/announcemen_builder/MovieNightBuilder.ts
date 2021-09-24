import AnnouncementBuilder from "./AnnouncementBuilder";
import MovieNight from "../util/announcements/MovieNight";
import {Message, MessageEmbed} from "discord.js";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import InternalError from "../error/InternalError";
import {inject, injectable} from "inversify";
import Logger from "../logger/Logger";
import DateUtil from "../util/DateUtil";
import VotingController from "../control/VotingController";

@injectable()
export default class MovieNightBuilder implements AnnouncementBuilder<MovieNight> {

    private _mostVoted?: Promise<Map<string, number>>

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(DateUtil) private dateUtil: DateUtil,
        @inject(VotingController) private votingController: VotingController
    ) { }

    async build(
        announcement: MovieNight,
        announcementConfig: AnnouncementConfiguration,
        movieNightDate: Date
    ): Promise<MessageEmbed> {
        this.logger.info("building movie night announcement")
        const messageEmbed = new MessageEmbed()
        const title = await this.getTitle(announcement, movieNightDate)
        const description = await this.getDescription(announcement, movieNightDate)

        messageEmbed
            .setTitle(title)
            .setDescription(description)
            .setColor('RED')

        await this.buildMostVotedFields(messageEmbed)
        MovieNightBuilder.buildReactionFields(messageEmbed, announcement)

        return messageEmbed
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
            let description = ""
            if (announcement.descriptionDefault && announcement.descriptionThisWeek) {
                if (!this.dateUtil.isThisWeek(date)) {
                    const dayAmount = this.dateUtil.getDaysUntil(date)
                    description = announcement.descriptionDefault.replace('$dayAmount', dayAmount.toString())
                } else {
                    const weekDay = this.dateUtil.getWeekDay(date)
                    description = announcement.descriptionThisWeek.replace("$weekDay", weekDay)
                }
            } else {
                reject(new InternalError("description " +
                    "configurations not set for " +
                    "announcement movieNight"))
            }

            this.isMovieDetermined()
                .then(isDetermined => {
                    if (!isDetermined) {
                        description += " " + announcement.movieUndetermined
                    }

                    resolve(description)
                })

        })
    }

    private async isMovieDetermined(): Promise<boolean> {
        const mostVoted = await this.getMostVoted()
        this.logger.debug(mostVoted)
        return mostVoted.size < 2
    }

    private static getReactions(announcement: MovieNight): Record<string, string> {
        const reactions = announcement.reactions

        if (reactions) {
            return reactions
        } else {
            throw new InternalError("reactions not set in the config")
        }

    }

    private static buildReactionFields(messageEmbed: MessageEmbed, announcement: MovieNight) {
        const reactions = MovieNightBuilder.getReactions(announcement)

        for (const [reaction, text] of Object.entries(reactions)) {
            messageEmbed
                .addField(reaction, text, true)
        }
    }

    async react(message: Message, announcement: MovieNight): Promise<void> {
        const reactions = MovieNightBuilder.getReactions(announcement)

        for (const [emoji] of Object.entries(reactions)) {
            await message.react(emoji)
        }
    }

    private async buildMostVotedFields(messageEmbed: MessageEmbed) {
        const mostVoted = await this.getMostVoted()

        if (mostVoted) {
            this.logger.debug(mostVoted)
            messageEmbed.addField('\u200B', '\u200B')

            mostVoted.forEach((count: number, movie: string) => {
                messageEmbed
                    .addField(movie, `${count} votes`, true)
            })

            messageEmbed.addField('\u200B', '\u200B')
        } else {
            throw new InternalError('most voted is not yet evaluated')
        }
    }

    private getMostVoted(): Promise<Map<string, number>> {
        if (this._mostVoted) {
            const mostVoted = this._mostVoted
            return new Promise(resolve => {
                resolve(mostVoted)
            })
        } else {
            const mostVotedObservable = this.votingController.mostVoted
            this._mostVoted = mostVotedObservable.toPromise()
            return mostVotedObservable.toPromise()
        }
    }
}
