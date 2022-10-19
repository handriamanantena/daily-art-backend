import * as mongoDB from "mongodb"
import {Comment} from "./Comment";

export interface Picture {
    pictureName?: string | "",
    url?: string | "",
    tags?: string[] | "",
    date?: Date  | "",
    height?: string,
    width?: string,
    author?: string,
    recentComments? :Comment[],
    pastCommentsIds?: string[],
    id?: mongoDB.ObjectId
}

export interface PictureDB extends Picture{
    _id?: mongoDB.ObjectId
    pastCommentsObjectIds?: mongoDB.ObjectId[]
}

