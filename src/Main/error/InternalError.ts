import CustomError from "./CustomError";

export default class InternalError extends CustomError {

    public toString(): string {
        return this.message
    }

}
