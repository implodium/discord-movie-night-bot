export default interface Config {
    get: <T>(configPath: string) => T,
    has: (configPath: string) => boolean,
    util: any
}
