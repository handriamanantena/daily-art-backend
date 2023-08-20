import Picturesmongodb from "./picturesmongodb";
import * as mongoDB from "mongodb";
import {Picture} from "./model/picture";
import {ObjectId} from "mongodb";
import {Comment, CommentDB, Reply} from "./model/Comment";
const uri =
    "mongodb://127.0.0.1:27017/?readPreference=primary&serverSelectionTimeoutMS=2000&appname=MongoDB%20Compass&directConnection=true&ssl=false";
const client: mongoDB.MongoClient = new mongoDB.MongoClient(uri);

export class Commentmongodb {

    pictureMongoDB : Picturesmongodb = new Picturesmongodb();

    async getCommentCollection() {
        await client.connect();
        const database = client.db('Art');
        return database.collection('comment');
    }

    async getPictureCommentsByIds(commentIds : string[]) {
        let objectIds : ObjectId[] = [];
        for (const commentId of commentIds) {
            let objectId = new mongoDB.ObjectId(commentId)
            objectIds.push(objectId)
        }
        return await this.getPictureCommentsByObjectIds(objectIds) as Comment[]
    }

    async getCommentByObjectId(commentId : mongoDB.ObjectId) : Promise<Comment> {
        let comment = {} as Comment
        try {
            const commentCollection = await this.getCommentCollection()
            let commentDB = await commentCollection.findOne(commentId) as CommentDB;
            commentDB["id"] = commentDB["_id"]?.toHexString() // TODO check this
            delete commentDB["_id"]
            comment = commentDB as Comment
            return comment;
        }
        finally {
            await client.close();
        }
    }

    async getPictureCommentsByObjectIds(commentIds : mongoDB.ObjectId[]) {
        let comments = []
        try {
            for (const commentId of commentIds) {
                let comment = await this.getCommentByObjectId(commentId)
                comments.push(comment)
            }
            return comments;
        }
        finally {
            await client.close();
        }
    }

    async insertComment(comment : Comment, pictureId: string) {
        let picture = await this.pictureMongoDB.getPictureById(pictureId) as Picture
        if (picture.recentComments == undefined) {
            picture.recentComments = []
        }
        let latestComment = await this.pictureMongoDB.insertRecentComment(comment, pictureId) as CommentDB
        console.log("last comment in comment code", latestComment)
        if(latestComment != undefined) {
            try {
                let commentDB = await this.getCommentCollection()
                return await commentDB.insertOne(latestComment)
            }
            finally {
                await client.close();
            }

        }
    }

    async insertReplyOnPastComment(reply: Reply, commentId : string) {
        let commentDB = await this.getCommentCollection()
        let objectId = new mongoDB.ObjectId(commentId)
        let pushValues =
            {
                $push: {
                    replies: {
                        $each: [reply],
                        $position: 0
                    }
                }
            }
        try {
            let result = await commentDB.updateOne({_id: objectId}, pushValues);
            return result
        }
        finally {
            await client.close()
        }
    }

}

export default Commentmongodb