import * as mongoDB from "mongodb"
import {Picture} from "./picture";
import {MongoDBEntity} from "./MongoDBEntity/MongoDBEntity";

export interface Artist extends MongoDBEntity {
    userName: string,
    pictures: mongoDB.ObjectId[], //only include url and id
    email: string,
    password?: string,
    profilePicture: string,
}

export interface ArtistDB extends Artist {
    _id?: mongoDB.ObjectId
}