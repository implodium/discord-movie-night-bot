import AnnouncementMessagesConfiguration from "./AnnouncementMessagesConfiguration";

export default interface AnnouncementConfiguration {
    automatic?: boolean
    announcementTime?: number
    everyCount?: number
    every?: string
    day?: number
    time?: string
    announcementMessages?: AnnouncementMessagesConfiguration
}
