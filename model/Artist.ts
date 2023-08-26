import * as mongoDB from "mongodb"
import {MongoDBEntity} from "./MongoDBEntity/MongoDBEntity";

export interface Artist extends MongoDBEntity {
    userName?: string,
    pictures?: mongoDB.ObjectId[], //only include url and id
    email: string,
    password?: string,
    profilePicture: string,
    bestStreak?: number,
    streak?: number,
}

export interface ArtistDB extends Artist {
    _id?: mongoDB.ObjectId
}