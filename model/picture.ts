import * as mongoDB from "mongodb"

export interface Picture {
    pictureName: string | "",
    url: string | "",
    tags: string[] | "",
    date: Date  | "",
    height: string,
    width: string,
    id?: mongoDB.ObjectId
}

export interface PictureDB extends Picture{
    _id?: mongoDB.ObjectId
}

