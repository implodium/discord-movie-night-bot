import Announcement from "./Announcement";

export default interface MovieNight extends Announcement {

    titleDefault?: string
    descriptionDefault?: string
    descriptionThisWeek?: string
    movieUndetermined?: string
    reactions?: Record<string, string>

}
