import * as mongoDB from "mongodb"
import {Picture} from "./picture";

export interface Gallery {
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
