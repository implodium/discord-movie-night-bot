import {MessageEmbed} from "discord.js";
import ScheduledMovieNight from "./ScheduledMovieNight";
import DateUtil from "./DateUtil";

export default class ListMovieNightResponseBuilder {

    private messageEmbed = new MessageEmbed()
    private readonly title = 'Upcoming movie nights'
    private readonly emptyListDescription = 'There are no upcoming movie nights'
    private readonly filledListDescription = 'The following are the upcoming movie nights'

    constructor(private movieNightList: ScheduledMovieNight[], private dateUtil: DateUtil) {
    }

    build(): MessageEmbed {
        this.setTitle()
        this.setDescription()
        this.setContent()
        return this.messageEmbed
    }

    private setTitle() {
        this.messageEmbed
            .setTitle(this.title)
    }

    private setDescription() {
        if (this.movieNightList.length !== 0) {
            this.setFilledListDescription()
        } else {
            this.setEmptyListDescription()
        }
    }

    private setEmptyListDescription() {
        this.messageEmbed
            .setDescription(this.emptyListDescription)
    }

    private setFilledListDescription() {
        this.messageEmbed
            .setDescription(this.filledListDescription)
    }

    private setContent() {
        this.movieNightList.forEach((sortedMovieNight, index) => {
            this.addMovieNightWithIndex(sortedMovieNight, index)
        })
    }

    private addMovieNightWithIndex(movieNight: ScheduledMovieNight, index: number) {
        this.messageEmbed.addField(
            ListMovieNightResponseBuilder.getIndexString(index),
            this.getDateString(movieNight)
        )
    }

    private getDateString(movieNight: ScheduledMovieNight) {
        return this.dateUtil.getDateStringOf(movieNight.date)
    }

    private static getIndexString(index: number) {
        return (index + 1).toString()
    }
}
