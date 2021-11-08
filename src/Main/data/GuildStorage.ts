import ScheduledMovieNight from "../util/ScheduledMovieNight";

export default interface GuildStorage {
    winnerMessageId?: string
    scheduledMovieNights?: Record<string, ScheduledMovieNight>
}
