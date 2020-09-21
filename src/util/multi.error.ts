export class MultiError extends Error {
    constructor(error: Error, ...moreErrors: Error[]) {
        const allErrors: Error[] = [error, ...moreErrors];
        let message: string = "Multiple errors occurred: [";
        for(const error of allErrors) {
            message += `"${error.message}", `;
        } 
        super(message.substring(0, message.length - 2) + "]");
        Object.setPrototypeOf(this, Error.prototype);
    }
}