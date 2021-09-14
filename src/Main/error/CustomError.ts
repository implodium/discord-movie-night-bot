export default abstract class CustomError extends Error {
    abstract type: string
    abstract output: string
}
