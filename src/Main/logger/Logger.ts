import * as winston from "winston";
import {injectable} from "inversify";
import {format} from "winston";

@injectable()
export default class Logger {

    private log: winston.Logger

    constructor() {
        this.log = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            transports: [

                new winston.transports.Console({
                    format: format.combine(
                        winston.format.colorize(),
                        winston.format.printf((info) => `[${info.level}] ${info.message}`),
                    )
                }),

            ]
        })
    }


    warn(msg: string) {
        this.log.warn(msg)
    }

    error(msg: string) {
        this.log.error(msg)
    }

    debug(msg: string) {
        this.log.debug(msg)
    }

    info(msg: string) {
        this.log.info(msg)
    }

}
