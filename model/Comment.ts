import {Artist} from "./Artist";
import * as mongoDB from "mongodb";

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

export interface ReplyDB extends Reply {
    nameOfOriginalCommenterObjectId?: mongoDB.ObjectId,
}

export interface CommentDB extends Comment {
    _id?: mongoDB.ObjectId,
    commenterObjectId? : mongoDB.ObjectId,
}