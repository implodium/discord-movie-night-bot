import MovieNight from "../util/announcements/MovieNight";
import MovieNightFinalDecision from "../util/announcements/MovieNightFinalDecision";
import MovieNightStart from "../util/announcements/MovieNightStart";

export default interface AnnouncementMessagesConfiguration {
    movieNight?: MovieNight,
    movieNightFinalDecision?: MovieNightFinalDecision,
    movieNightStart?: MovieNightStart
}
