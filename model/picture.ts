import {ObjectId} from "../adapters/database/MongoDB";
import {Comment} from "./Comment";
import {MongoDBEntity} from "./MongoDBEntity/MongoDBEntity";

export interface Picture {
    pictureName?: string,
    url?: string,
    tags?: string[],
    date: Date,
    height?: string,
    width?: string,
    userName: string,
    recentComments? :Comment[],
    pastCommentsIds?: string[],
    dailyChallenge?: string,
    id?: ObjectId
}

export interface PictureDB extends Picture, MongoDBEntity {
    pastCommentsObjectIds?: ObjectId[]
}

