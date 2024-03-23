import { JsonWebTokenError } from "jsonwebtoken";

export class ClientError extends Error {
    message: string;
    key:string
    constructor(
        message:string,
        key:string
    ){
        super();
        this.message = message
        this.key = key
    }
    toString(){
        return JSON.stringify(this)
    }
}
