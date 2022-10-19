import * as mongoDB from "mongodb"
import {Picture} from "./picture";

export interface Artist {
    name: string,
    pictures: Picture[],
    email: string,
    password: string,
    profilePicture: string,
}

export interface ArtistDB extends Artist {
    _id?: mongoDB.ObjectId
}