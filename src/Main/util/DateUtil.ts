import {inject, injectable} from "inversify";
import Logger from "../logger/Logger";

@injectable()
export default class DateUtil {

    constructor(@inject(Logger) private logger: Logger) {}

    private weekDays = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday"
    ]

    getWeekDay(date: Date) {
        return this.weekDays[date.getDay() - 1]
    }

    isThisWeek(date: Date): boolean {
        const daysDiff: number = this.getDaysUntil(date)
        return daysDiff < 7
            && date.getDay() > new Date().getDay()
            && date.getDay() < 7;
    }

    getDaysBetween(date1: Date, date2: Date): number {
        const milliDiff = Math.abs(date1.getTime() - date2.getTime())
        return Math.round(milliDiff / 86400000) // conversion to days
    }

    getDaysUntil(date: Date): number {
        return this.getDaysBetween(new Date(), date)
    }

}
