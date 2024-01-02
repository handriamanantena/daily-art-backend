import {ObjectId} from "../adapters/database/MongoDB";
import {MongoDBEntity} from "./MongoDBEntity/MongoDBEntity";

export interface Artist {
    userName: string,
    pictures?: ObjectId[], //only include url and id
    email: string,
    password?: string,
    profilePicture: string,
    bestStreak?: number,
    streak?: number,
}

export interface ArtistDB extends Artist {
    _id: ObjectId
}