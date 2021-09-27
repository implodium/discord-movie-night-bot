import CustomError from "./CustomError";

export default class InternalError extends CustomError {

    public type: string = 'internal'
    public output: string = this.message
}
