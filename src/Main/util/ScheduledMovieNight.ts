import {Job} from "node-schedule";
import {Subject} from "rxjs";

export default interface ScheduledMovieNight {
    date: Date
    movieNightFinalDecisionJob: Job,
    movieNightJob: Job,
    movieNightStartJob: Job,
    event: Subject<void>
}
