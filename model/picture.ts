import * as mongoDB from "mongodb"
import {Comment} from "./Comment";
import {MongoDBEntity} from "./MongoDBEntity/MongoDBEntity";

export interface Picture extends MongoDBEntity {
    pictureName: string,
    url?: string,
    tags?: string[],
    date: Date,
    height?: string,
    width?: string,
    userName: string,
    recentComments? :Comment[],
    pastCommentsIds?: string[],
    id?: mongoDB.ObjectId
}

export interface PictureDB extends Picture{
    _id?: mongoDB.ObjectId
    pastCommentsObjectIds?: mongoDB.ObjectId[]
}

