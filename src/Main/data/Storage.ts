import ScheduledMovieNight from "../util/ScheduledMovieNight";

export default interface Storage {
    winnerMessageIds?: Record<string, string>
    scheduledMovieNights?: Record<string, ScheduledMovieNight[]>
}
