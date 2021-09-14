class UserError extends Error {

    public toString(): string {
        return `❌ ${this.message}`
    }

}
