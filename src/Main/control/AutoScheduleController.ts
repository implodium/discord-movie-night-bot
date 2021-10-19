import {inject, injectable} from "inversify";
import GuildConfigurations from "../config/GuildConfigurations";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";
import GuildConfiguration from "../config/GuildConfiguration";
import * as cron from "node-cron";
import InternalError from "../error/InternalError";
import MovieNightController from "./MovieNightController";
import ConfigController from "./ConfigController";
import Logger from "../logger/Logger";

@injectable()
export default class AutoScheduleController {

    constructor(
        @inject(Logger) private logger: Logger,
        @inject(ConfigController) private configController: ConfigController,
        @inject(MovieNightController) private movieNightController: MovieNightController
    ) { }


    async init() {
        const guildConfigs: GuildConfigurations = this.configController.getConfig('guilds')

        for (const [, guildConfig] of Object.entries(guildConfigs)) {
            const announcementConfig = await this.configController
                .getAnnouncementConfigByGuildConfig(guildConfig)
            await this.initScheduler(announcementConfig, guildConfig)
        }
    }

    async initScheduler(config: AnnouncementConfiguration, guildConfig: GuildConfiguration) {
        if (config.automatic !== null && config && config.everyCount){
            if (config.automatic) {
                const scheduleString = await AutoScheduleController.getScheduleString(config)
                cron.schedule(scheduleString, async () => {
                    const movieNightDate = AutoScheduleController.getNextMovieDate(config)

                    await this.movieNightController
                        .startMovieNight(movieNightDate, guildConfig)
                })
            }
        } else {
            throw new InternalError(
                "config properties missing (announcements.automatic," +
                " announcements.everyCount) or config not found at all"
            )
        }
    }

    private static async getScheduleString(config: AnnouncementConfiguration): Promise<string> {
        if (config.every && config.day && config.time && config.everyCount) {
            switch (config.every) {
                case 'week':
                    let weekDay = config.day
                    const [hour, minute] = config.time.split(':')

                    if (weekDay <= 0) {
                        weekDay = 7 + weekDay
                    } else if (weekDay > 7) {
                        weekDay = weekDay - 7
                    }

                    return `0 ${minute} ${hour} * * ${weekDay}/${config.everyCount}`
                default:
                    throw new InternalError('Configuration property does not exist')
            }
        } else {
            throw new InternalError("there is configurations missing " +
                "for determining the scheduling string")
        }
    }

    private static getNextMovieDate(config: AnnouncementConfiguration): Date {
        if (config.everyCount && config.every) {
            switch (config.every) {
                case 'week':
                    const movieNight = new Date()
                    movieNight.setDate(movieNight.getDate() + 7 * config.everyCount)
                    return movieNight
                default:
                    throw new InternalError("every type is not implemented")
            }
        } else {
            throw new InternalError('required config properties are not defined')
        }
    }
}
