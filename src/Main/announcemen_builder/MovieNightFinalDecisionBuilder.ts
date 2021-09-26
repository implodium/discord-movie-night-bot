import {inject, injectable} from "inversify";
import AnnouncementBuilder from "./AnnouncementBuilder";
import MovieNightFinalDecision from "../util/announcements/MovieNightFinalDecision";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import {MessageEmbed} from "discord.js";
import InternalError from "../error/InternalError";
import VotingController from "../control/VotingController";
import {take} from "rxjs/operators";
import Logger from "../logger/Logger";

@injectable()
export default class MovieNightFinalDecisionBuilder implements AnnouncementBuilder<MovieNightFinalDecision> {

    constructor(
        @inject(VotingController) private votingController: VotingController,
        @inject(Logger) private logger: Logger
    ) { }


    async build(announcement: MovieNightFinalDecision, announcementConfig: AnnouncementConfiguration, movieNightDate: Date): Promise<MessageEmbed> {
        const title = MovieNightFinalDecisionBuilder.getTitle(announcement)
        const description = await this.getDescription(announcement)
        const determinedMovie = await this.determineMovie()

        return new MessageEmbed()
            .setColor('RED')
            .setTitle(title)
            .setDescription(description)
            .addField(determinedMovie.name,`${determinedMovie.count} counts`)
    }

    private static getTitle(announcement: MovieNightFinalDecision): string {
        if (announcement.titleDefault) {
            return announcement.titleDefault
        } else {
            throw new InternalError("title is missing in the configuration")
        }
    }

    private get mostVoted(): Promise<Map<string, number>> {
        return new Promise(resolve => {
            this.votingController.mostVoted
                .pipe(take(1))
                .subscribe(value => {
                    this.logger.debug(value)
                    resolve(value)
                })
        })
    }

    private async getDescription(announcement: MovieNightFinalDecision): Promise<string> {
        const isDetermined = await this.isDetermined()

        if (isDetermined && announcement.descriptionDetermined) {
            return announcement.descriptionDetermined
        } else if (announcement.descriptionUndetermined) {
            return announcement.descriptionUndetermined
        } else {
            throw new InternalError('description for case was not set in the config')
        }
    }

    private async isDetermined(): Promise<boolean> {
        return (await this.mostVoted).size === 1
    }

    private async determineMovie(): Promise<{name: string, count: number}> {
        const mostVoted = await this.mostVoted
        const mostVotedNames = Array.from(mostVoted)
        const randomIndex = Math.round(Math.random() * (mostVotedNames.length - 1))
        const [randomMostVotedName, randomMostVotedCount] = mostVotedNames[randomIndex]

        return {
            name: randomMostVotedName,
            count: randomMostVotedCount
        }
    }
}
