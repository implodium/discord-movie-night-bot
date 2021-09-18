import MovieNightReminderAnnouncements from "../util/announcements/MovieNightReminderAnnouncements";
import FinalMovieDecisionAnnouncement from "../util/announcements/FinalMovieDecisionAnnouncement";
import FinalMovieNightAnnouncement from "../util/announcements/FinalMovieNightAnnouncement";

export default interface AnnouncementMessagesConfiguration {
    movieNightReminder?: MovieNightReminderAnnouncements,
    finalMovieDecision?: FinalMovieDecisionAnnouncement,
    finalMovieNight?: FinalMovieNightAnnouncement
}
