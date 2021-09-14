import CustomError from "./CustomError";

export default class UserError extends CustomError {

    public guildId: string

    public toString(): string {
        return `❌ ${this.message}`
    }

    constructor(msg: string, guildId: string) {
        super(msg);
        this.guildId = guildId
    }

}
