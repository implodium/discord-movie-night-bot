import StorableMovieNight from "../util/StorableMovieNight";

export default interface GuildStorage {
    winnerMessageId?: string
    scheduledMovieNights?: StorableMovieNight[]
}
