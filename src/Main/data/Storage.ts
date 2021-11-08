import GuildStorage from "./GuildStorage";

export default interface Storage {
    guildStorages: Record<string, GuildStorage>
}
