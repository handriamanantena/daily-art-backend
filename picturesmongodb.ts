import * as mongoDB from "mongodb";
import {Picture, PictureDB} from "./model/picture";
import {Gallery, GalleryDB} from "./model/Gallery";
import {Comment, CommentDB, Reply} from "./model/Comment";
import config from "./config/config";
import {collections} from "./dbConnection/dbConn";


export class Picturesmongodb {


    async getPicturesCollection() {
        return collections.pictures;
    }


    async getGalleryCollection() {
        return collections.gallery;
    }

    async getAllPictures() {
        let allPictures : Picture[] = []
        try {
            const pictures = await this.getPicturesCollection()
            if(pictures == undefined) {
                console.error("pictures collection missing");
                throw new Error("pictures collection missing");
            }
            let picturesArray =  await pictures.find({}).toArray()
            allPictures = picturesArray.map(pictureDB => {
                pictureDB["id"] = pictureDB["_id"]
                delete pictureDB["_id"]
                let picture = pictureDB as Picture
                return picture;
            }) as Picture[]
        }
        finally {
            return allPictures;
        }
    }

    async getPictureByName(pictureName : string) {
        let picture : Picture = {};
        try {
            const pictures = await this.getPicturesCollection()
            if(pictures == undefined) {
                console.error("pictures collection missing");
                throw new Error("pictures collection missing");
            }
            const query = {url: pictureName};
            picture = await pictures.findOne(query).then(value=> {
                return value as Picture
            })
        }
        catch (e) {
            return new Promise<Picture>((resolve, reject) => {
                reject(e)
            })
        }
        finally {
            // Ensures that the client will close when you finish/error
            return picture;
        }

    }

    async getPictureById(id: string) {
        let objectId = new mongoDB.ObjectId(id)
        return await this.getPictureByObjectId(objectId) as Picture
    }

    async getPictureByObjectId(id : mongoDB.ObjectId) {
        let picture = {}
        try {
            const pictures = await this.getPicturesCollection()
            if(pictures == undefined) {
                console.error("pictures collection missing");
                throw new Error("pictures collection missing");
            }
            let pictureDB = await pictures.findOne(id) as PictureDB;
            pictureDB["id"] = pictureDB["_id"]
            delete pictureDB["_id"]
            picture = pictureDB as Picture
        }
        finally {
            return picture;
        }
    }

    async getGalleryByPage(page: number) {
        let gallery : GalleryDB = {}
        try {
            const galleryCollection = await this.getGalleryCollection();
            const query = {page: page};
            console.log(query)
            if(galleryCollection == undefined) {
                console.error("gallery collection missing");
                throw new Error("gallery collection missing");
            }
            gallery = await galleryCollection.findOne(query) as GalleryDB;
            console.log(page)
            gallery = await this.associatePicturesToGallery(gallery)
        }
        finally {
            // Ensures that the client will close when you finish/error
            return gallery
        }
    }

    async getPicturesByDate(date: Date) {
        let gallery
        try {
            const galleryCollection = await this.getGalleryCollection();
            // Query for a movie that has the title 'Back to the Future'
            const query = {$and: [ { startMonth: { $lte:new Date(date)} }, { endMonth: {$gte : new Date(date)} }]};
            if(galleryCollection == undefined) {
                console.error("gallery collection missing");
                throw new Error("gallery collection missing");
            }
            gallery = await galleryCollection.findOne(query) as GalleryDB;
            gallery = await this.associatePicturesToGallery(gallery)
        }
        finally {
            // Ensures that the client will close when you finish/error
            return gallery
        }
    }

    async associatePicturesToGallery(gallery: GalleryDB) {
        let pictures : Picture[] = []
        if(gallery && gallery.pictureIds) {
            for (const pictureId of gallery.pictureIds) {
                await this.getPictureByObjectId(pictureId).then((value : Picture) => {
                    pictures.push(value)
                })
            }
            gallery.pictures = pictures
            delete gallery.pictureIds
        }
        return gallery
    }

    async insertRecentComment(comment: Comment, pictureId: string) {
        try {
            const pictures = await this.getPicturesCollection()
            let objectId = new mongoDB.ObjectId(pictureId)
            let commentWitObjectId = comment as CommentDB
            commentWitObjectId._id = new mongoDB.ObjectId()
            let pushValues =
                {
                    $push: {
                        recentComments: {
                            $each: [commentWitObjectId],
                            $position: 0
                        }
                    }
                }
            if(pictures == undefined) {
                console.error("pictures collection missing");
                throw new Error("pictures collection missing");
            }
            let result = await pictures.updateOne({_id: objectId}, pushValues);
            console.log("insert comment result ", result)
            let picture = await pictures.findOne({_id: objectId}) as Picture
            if(picture.recentComments == undefined) {
                throw new Error("picture does not exist")
            }
            console.log("length: ", picture.recentComments.length)
            if (picture.recentComments.length > config.comments.maxRecentComments) {
                await pictures.updateOne({_id: objectId}, {$pop: {recentComments: 1}});
                console.log("list of comments in memory", picture.recentComments)
                let lastComment = picture.recentComments.pop()
                console.log("pop last comment ", lastComment)
                return lastComment
            }
            else {
                return undefined;
            }
        } catch (e) {
            console.log(e)
        }
    }

    // TODO need to add reply on recent comment. might already be done in comment mongodb
    async insertReplyOnPicture(reply: Reply, pictureId: string) {
        let pictureDB = await this.getPicturesCollection()
        let pushValues =
            {
                $push: {
                    replies: {
                        $each: [reply],
                        $position: 0
                    }
                }
            }
        let objectId = new mongoDB.ObjectId(pictureId)
        if(pictureDB == undefined) {
            console.error("pictures collection missing");
            throw new Error("pictures collection missing");
        }
        let result = await pictureDB.updateOne({_id: objectId}, pushValues)
        return result
    }

    //@Depricated
    async insertReplyOnRecentComment(reply: Reply, pictureId: string) {
        let pictureDB = await this.getPicturesCollection()
        let pushValues =
            {
                $push: {
                    replies: {
                        $each: [reply],
                        $position: 0
                    }
                }
            }
        let objectId = new mongoDB.ObjectId(pictureId)
        if(pictureDB == undefined) {
            console.error("pictures collection missing");
            throw new Error("pictures collection missing");
        }
        let result = await pictureDB.updateOne({_id: objectId}, pushValues)
        return result
    }

    async addPicture(picture: Picture) {
        try{
            let collection = await this.getPicturesCollection()
            if(collection == undefined) {
                console.error("picture collection missing");
                throw new Error("picture collection missing");
            }
            let response = await collection.insertOne(picture)
            return response;
        }
        catch (e) {
            console.log(e)
        }
    }

}

export default Picturesmongodb