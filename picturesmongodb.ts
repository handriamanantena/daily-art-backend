import * as mongoDB from "mongodb";
import {Picture, PictureDB} from "./model/picture";
import {Gallery, GalleryDB} from "./model/Gallery";
const uri =
    "mongodb://127.0.0.1:27017/?readPreference=primary&serverSelectionTimeoutMS=2000&appname=MongoDB%20Compass&directConnection=true&ssl=false";
const client: mongoDB.MongoClient = new mongoDB.MongoClient(uri);

export class Picturesmongodb {

    async getPictureByName(pictureName : string) : Promise<Picture> {
        try {
            await client.connect();
            const database = client.db('Art');
            const pictures = database.collection('pictures');
            // Query for a movie that has the title 'Back to the Future'
            const query = {url: pictureName};
            return await pictures.findOne(query).then(value=> {
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
            await client.close();
        }

    }

    async getPictureById(id : mongoDB.ObjectId) {
        try {
            await client.connect();
            const database = client.db('Art');
            const pictures = database.collection('pictures');
            return await pictures.findOne(id) as PictureDB;
        }
        finally {
            await client.close();
        }
    }

    /*async getPicturesByIndex() {
        let pictures = []
    }*/

    async getPicturesByDate(date: Date) {
        let gallery
        try {
            await client.connect();
            const database = client.db('Art');
            const galleryCollection = database.collection('gallery');
            // Query for a movie that has the title 'Back to the Future'
            const query = {$and: [ { startMonth: { $lte:new Date(date)} }, { endMonth: {$gte : new Date(date)} }]};
            gallery = await galleryCollection.findOne(query) as GalleryDB;
            let pictures : Picture[] = []
            console.log(gallery)
            if(gallery.pictureIds) {
                for (const pictureId of gallery.pictureIds) {
                    console.log(pictureId)
                    await this.getPictureById(pictureId).then((value : Picture) => {
                        pictures.push(value)
                    })
                }
            }
            gallery.pictures = pictures
            delete gallery.pictureIds
        }
        finally {
            // Ensures that the client will close when you finish/error
            await client.close();
            return gallery
        }
    }
}

export default Picturesmongodb