import {inject, injectable} from "inversify";
import * as dotenv from 'dotenv'
import Config from "../typings/Config";
import Logger from "../logger/Logger";
import GuildConfigurations from "../config/GuildConfigurations";
import GuildConfiguration from "../config/GuildConfiguration";
import AnnouncementConfiguration from "../config/AnnouncementConfiguration";

@injectable()
export default class ConfigController {

    private config?: Config

    constructor(
        @inject(Logger) private logger: Logger
    ) {
        ConfigController.initDotEnv()
        this.initNodeConfig()
    }


    private static initDotEnv() {
        if (process.env.NODE_ENV && process.env.PWD && process.env.NODE_ENV === 'development') {
            dotenv.config({path: `${process.env.PWD}/config/env/.env.dev`})
        }
    }

    private initNodeConfig() {
        if (process.env.NODE_ENV) {
            process.env.NODE_CONFIG_DIR = `${process.cwd()}/config/app`
            this.config = require('config')
        }
    }

    public debugNodeConfig() {
        if (this.config) {
            this.logger.debug(this.config.util.getConfigSources())
        }
    }

    getEnv(envString: string) {
        return process.env[envString]
    }

    getConfig<T>(configPath: string): T {
        if (this.config) {
            return this.config.get(configPath)
        } else {
            throw new Error('config not found')
        }
    }

    getGuildConfigurations(): GuildConfigurations {
        return this.getConfig('guilds')
    }

    getAnnouncementConfigByGuildConfig(guildConfig: GuildConfiguration): Promise<AnnouncementConfiguration> {
        return new Promise((resolveConfig, reject) => {
            if(guildConfig.announcements) {
                resolveConfig(guildConfig.announcements)
            } else {
                this.getAnnouncementRootConfig()
                    .then(resolveConfig)
                    .catch(reject)
            }
        })
    }

    getAnnouncementRootConfig(): Promise<AnnouncementConfiguration> {
        return new Promise((resolveRoot) => {
            resolveRoot(this.getConfig('announcements'))
        })
    }

    getConfigurationByGuildId(guildId: string): GuildConfiguration {
        return this.getConfig(`guilds.${guildId}`)
    }
}
