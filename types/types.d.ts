import {Picture} from "../model/picture";
import {Session} from "express-session";

/*export interface SessionData extends Session {
    email?: string;
}*/

import "express-session";
import {Artist} from "../model/Artist"; // don't forget to import the original module

declare module "express-session" {
    export interface SessionData {
        email: string // whatever property you like,
        profilePicture?: string
        artist?: Artist;
    }
}


/*declare global {
    namespace Express {
        export interface SessionData  {
            email?: string,
            profilePicture?: string,
            recentPictures?: Picture[], // only include name and url,
            userName: string
        }
    }
}*/