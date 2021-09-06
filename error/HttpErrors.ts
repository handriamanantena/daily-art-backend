
export class HttpError {
    constructor(error: any) {
        this.error = error
    }
    error: {
        message: string,
        innerError: any
    }
}

export class Http404Error extends Error {
    constructor(error: HttpError) {
        super();
        this.error = error
    }
    error: HttpError
}

export default {
    Http404Error,
    HttpError
}