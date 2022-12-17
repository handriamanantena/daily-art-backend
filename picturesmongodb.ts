import * as mongoDB from "mongodb";
import {Picture, PictureDB} from "./model/picture";
import {Gallery, GalleryDB} from "./model/Gallery";
import {Comment, CommentDB, Reply} from "./model/Comment";
import config from "./config/config";
const uri =
    "mongodb://127.0.0.1:27017/?readPreference=primary&serverSelectionTimeoutMS=2000&appname=MongoDB%20Compass&directConnection=true&ssl=false";
const client: mongoDB.MongoClient = new mongoDB.MongoClient(uri);

export class Picturesmongodb {


    async getPicturesCollection() {
        await client.connect();
        const database = client.db('Art');
        return database.collection('pictures');
    }

    async getGalleryCollection() {
        await client.connect();
        const database = client.db('Art');
        return database.collection('gallery');
    }

    async getAllPictures() {
        let allPictures : Picture[] = []
        try {
            const pictures = await this.getPicturesCollection()
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
            await client.close();
        }
    }

    async getPictureByName(pictureName : string) {
        let picture : Picture = {};
        try {
            const pictures = await this.getPicturesCollection()
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
            await client.close();
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
            let pictureDB = await pictures.findOne(id) as PictureDB;
            pictureDB["id"] = pictureDB["_id"]
            delete pictureDB["_id"]
            picture = pictureDB as Picture
        }
        finally {
            return picture;
            await client.close();
        }
    }

    async getGalleryByPage(page: number) {
        let gallery : GalleryDB = {}
        try {
            const galleryCollection = await this.getGalleryCollection();
            const query = {page: page};
            console.log(query)
            gallery = await galleryCollection.findOne(query) as GalleryDB;
            console.log(page)
            gallery = await this.associatePicturesToGallery(gallery)
        }
        finally {
            // Ensures that the client will close when you finish/error
            return gallery
            await client.close();
        }
    }

    async getPicturesByDate(date: Date) {
        let gallery
        try {
            const galleryCollection = await this.getGalleryCollection();
            // Query for a movie that has the title 'Back to the Future'
            const query = {$and: [ { startMonth: { $lte:new Date(date)} }, { endMonth: {$gte : new Date(date)} }]};
            gallery = await galleryCollection.findOne(query) as GalleryDB;
            gallery = await this.associatePicturesToGallery(gallery)
        }
        finally {
            // Ensures that the client will close when you finish/error
            return gallery
            await client.close();
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
        } finally {
            await client.close();
        }
    }

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
        let result = await pictureDB.updateOne({_id: objectId}, pushValues)
        return result
    }

}

export default Picturesmongodb