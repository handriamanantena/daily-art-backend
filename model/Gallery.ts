import * as mongoDB from "mongodb"
import {Picture} from "./picture";
import {MongoDBEntity} from "./MongoDBEntity/MongoDBEntity";

export interface Gallery extends MongoDBEntity {
    startMonth?: Date,
    endMonth?: Date,
    pictures?: Picture[],
    pictureCount?: number,
    page?: number
}

export interface GalleryDB extends Gallery {
    _id?: mongoDB.ObjectId
    pictureIds?: mongoDB.ObjectId[]
}
