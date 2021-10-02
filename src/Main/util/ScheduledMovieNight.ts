import {Job} from "node-schedule";

export default interface ScheduledMovieNight {
    date: Date
    movieNightFinalDecisionJob: Job,
    movieNightJob: Job,
    movieNightStartJob: Job
}
