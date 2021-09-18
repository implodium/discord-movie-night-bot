import AnnouncementMessagesConfiguration from "./AnnouncementMessagesConfiguration";

export default interface AnnouncementConfiguration {
    automatic?: boolean
    announcementTime?: string
    everyCount?: number
    every?: string
    day?: number
    announcementMessages?: AnnouncementMessagesConfiguration
}
