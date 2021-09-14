import {injectable} from "inversify";
import * as dotenv from 'dotenv'
import Config from "../typings/Config";
import GuildConfiguration from "../config/GuildConfiguration";

@injectable()
export default class ConfigController {

    private config?: Config

    constructor() {
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
            console.log(this.config.util.getConfigSources())
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

    getGuildConfigurations(): Record<string, GuildConfiguration> {
        return this.getConfig('guilds')
    }
}
