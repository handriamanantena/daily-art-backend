import {ObjectId} from "../adapters/database/MongoDB";
import {Picture} from "./picture";
import {MongoDBEntity} from "./MongoDBEntity/MongoDBEntity";

export interface Gallery  {
    startMonth?: Date,
    endMonth?: Date,
    pictures?: Picture[],
    pictureCount?: number,
    page?: number
}

export interface GalleryDB extends Gallery, MongoDBEntity {
    pictureIds?: ObjectId[]
}
