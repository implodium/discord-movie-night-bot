import {inject, injectable} from "inversify";
import Storage from "../data/Storage";
import ConfigController from "./ConfigController";
import * as fs from 'fs'
import InternalError from "../error/InternalError";
import Logger from "../logger/Logger";
import UserError from "../error/UserError";
import GuildConfiguration from "../config/GuildConfiguration";
import StorableMovieNight from "../util/StorableMovieNight";

@injectable()
export default class StorageController {

    constructor(
        @inject(ConfigController) private configController: ConfigController,
        @inject(Logger) private logger: Logger
    ) { }


    async initGuild(guildConfig: GuildConfiguration) {
        if (guildConfig.id) {
            const storage = await this.get()
            storage.guildStorages[guildConfig.id] = {}
        } else {
            throw new InternalError('id was not set in the guild configuration')
        }
    }

    async get(): Promise<Storage> {
        const fileLocation = await this.getFileLocation()

        try {
            const storage = await fs.promises.readFile(fileLocation, {encoding: "utf-8"})
            return JSON.parse(storage)
        } catch (e) {
            const storage = {guildStorages: {}}
            await this.write({
                guildStorages: {}
            })

            return storage
        }
    }

    async clearGuildStorage(guildId: string): Promise<Storage> {
        const [fileLocation, storage] = await Promise.all([this.getFileLocation(), this.get()])

        if (fileLocation && storage && storage.guildStorages) {
            delete storage.guildStorages[guildId]
            await this.write(storage)
            return storage
        } else {
            throw new UserError("storage not found", guildId)
        }
    }

    async write(storage: Storage): Promise<void> {
        const fileLocation = await this.getFileLocation()

        try {
            await fs.promises.writeFile(fileLocation, JSON.stringify(storage, null, 2))
        } catch (e) {
            await StorageController.createPathTo(fileLocation)
            await this.write(storage)
        }
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

    private static async createPathTo(path: string): Promise<void> {
        const directoryPath = StorageController.getDirectoryOf(path)
        await fs.promises.mkdir(directoryPath, {recursive: true})
    }

    private static getDirectoryOf(filePath: string): string {
        const pathComponents = filePath.split('/')
        const directoryLocation = pathComponents
            .slice(0, pathComponents.length - 1)
        return directoryLocation.join('/')
    }

    async pushMovieNight(movieNight: StorableMovieNight, id: string) {
        const storage = await this.get()
        const guildStorage = storage.guildStorages[id];

        if (guildStorage) {
            this.logger.debug("storage is available")
            if (!guildStorage.scheduledMovieNights) {
                guildStorage.scheduledMovieNights = []


            }

            guildStorage.scheduledMovieNights.push(movieNight)
            await this.write(storage)

        } else {
            throw new InternalError('Guild Storage not defined')
        }
    }
}
