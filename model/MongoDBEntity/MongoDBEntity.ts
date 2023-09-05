import * as mongoDB from "mongodb"

export interface MongoDBEntity {
    _id: mongoDB.ObjectId;
}