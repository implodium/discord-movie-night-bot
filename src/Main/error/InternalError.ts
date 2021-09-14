export default class InternalError extends Error{

    public toString(): string {
        return this.message
    }

}
