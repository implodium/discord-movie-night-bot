import CustomError from "./CustomError";

class UserError extends CustomError {

    public toString(): string {
        return `❌ ${this.message}`
    }

}
