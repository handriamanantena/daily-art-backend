import * as mongoDB from "mongodb"
import {Picture} from "./picture";

export interface Artist {
    userName: string,
    pictures: Picture[], //only include url and id
    email: string,
    password?: string,
    profilePicture: string,
}

export interface ArtistDB extends Artist {
    _id?: mongoDB.ObjectId
}