import * as mongoDB from "mongodb";
import {MongoDBEntity} from "./MongoDBEntity/MongoDBEntity";

export interface Comment {
    nameOfCommenter?: string,
    commenterId?: string,
    likeCount?: number,
    replies?:  Reply[],
    comment?: string,
    date?: Date,
    id?: string
}

export interface Reply extends Comment {
    nameOfOriginalCommenter?: string,
    originalCommenterId?: string,
}

export interface ReplyDB extends Reply, MongoDBEntity {
    nameOfOriginalCommenterObjectId?: mongoDB.ObjectId,
}

export interface CommentDB extends Comment, MongoDBEntity {
    commenterObjectId? : mongoDB.ObjectId,
}