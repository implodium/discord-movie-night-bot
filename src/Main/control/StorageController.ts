import {inject, injectable} from "inversify";
import Storage from "../data/Storage";
import ConfigController from "./ConfigController";
import * as fs from 'fs'
import InternalError from "../error/InternalError";
import Logger from "../logger/Logger";

@injectable()
export default class StorageController {

    constructor(
        @inject(ConfigController) private configController: ConfigController,
        @inject(Logger) private logger: Logger
    ) { }


    get(): Promise<Storage> {
        return new Promise((resolve, reject) => {
            this.getFileLocation()
                .then(fileLocation => {
                    fs.readFile(fileLocation, {encoding: "utf8"},  (err, data) => {
                        if (err) {
                            reject(err)
                        } else {
                            let json: Storage
                            try {
                                json = JSON.parse(data);
                            } catch {
                                json = {}
                            }
                            resolve(json)
                        }
                    })
                })
                .catch(reject)
        })
    }

    write(storage: Storage): Promise<void> {
        return new Promise((resolve, reject) => {
            this.getFileLocation()
                .then(fileLocation => {
                    fs.writeFile(fileLocation, JSON.stringify(storage), err => {
                        if (err) {
                            reject()
                        } else {
                            resolve()
                        }
                    })
                })
                .catch(reject)
        })
    }

    private getFileLocation(): Promise<string> {
        return new Promise((resolve, reject) => {
            const fileLocation = this.configController.getConfig('storageFileLocation')

            if (fileLocation && process.env.PWD) {
                resolve(`${process.env.PWD}/${fileLocation}`)
            } else {
                reject(new InternalError("storage file location is not configured"))
            }
        })
    }
}
