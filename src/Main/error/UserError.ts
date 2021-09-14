import CustomError from "./CustomError";

export default class UserError extends CustomError {

    public type: string = 'user'
    public guildId: string
    public output: string = `:x: ${this.message}`

    constructor(msg: string, guildId: string) {
        super(msg);
        this.guildId = guildId
    }

}
