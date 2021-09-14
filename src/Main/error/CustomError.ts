export default abstract class CustomError extends Error {
    abstract toString(): string;
}
