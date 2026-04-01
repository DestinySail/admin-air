export class AppError extends Error {
    public readonly code: number

    constructor(message: string, code = 0) {
        super(message)
        this.code = code
    }
}
