import {injectable} from "inversify";
import * as dotenv from 'dotenv'
import * as config from "config";

@injectable()
export default class ConfigController {

    constructor() {
        this.initDotEnv()
        this.initNodeConfig()
    }


    private initDotEnv() {
        if (process.env.NODE_ENV && process.env.PWD && process.env.NODE_ENV === 'development') {
            dotenv.config({path: `${process.env.PWD}/config/env/.env.dev`})
        }
    }

    private initNodeConfig() {
        if (process.env.NODE_ENV) {
            process.env.NODE_CONFIG_DIR = `${process.cwd()}/config/app`
            config.util.loadFileConfigs()
        }
    }

    public debugNodeConfig() {
        console.log(config.util.getConfigSources())
    }

    getEnv(envString: string) {
        return process.env[envString]
    }
}
