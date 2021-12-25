import * as mongoDB from "mongodb";
import {Picture, PictureDB} from "./model/picture";
import {Gallery, GalleryDB} from "./model/Gallery";
const uri =
    "mongodb://127.0.0.1:27017/?readPreference=primary&serverSelectionTimeoutMS=2000&appname=MongoDB%20Compass&directConnection=true&ssl=false";
const client: mongoDB.MongoClient = new mongoDB.MongoClient(uri);

export class Picturesmongodb {

    async getAllPictures() {
        try {
            await client.connect();
            const database = client.db('Art');
            const pictures =  database.collection('pictures');
            let picturesArray =  await pictures.find({}).toArray()
            return picturesArray.map(pictureDB => {
                pictureDB["id"] = pictureDB["_id"]
                delete pictureDB["_id"]
                let picture = pictureDB as Picture
                return picture;
            }) as Picture[]
        }
        finally {
            await client.close();
        }
    }

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
            let pictureDB = await pictures.findOne(id) as PictureDB;
            pictureDB["id"] = pictureDB["_id"]
            delete pictureDB["_id"]
            let picture = pictureDB as Picture
            return picture;
        }
        finally {
            await client.close();
        }
    }

    async getGalleryByPage(page: number) {
        let gallery
        try {
            await client.connect();
            const database = client.db('Art');
            const galleryCollection = database.collection('gallery');
            const query = {page: page};
            console.log(query)
            gallery = await galleryCollection.findOne(query) as GalleryDB;
            console.log(page)
            gallery = await this.associatePicturesToGallery(gallery)
        }
        finally {
            // Ensures that the client will close when you finish/error
            await client.close();
            return gallery
        }
    }

    async getPicturesByDate(date: Date) {
        let gallery
        try {
            await client.connect();
            const database = client.db('Art');
            const galleryCollection = database.collection('gallery');
            // Query for a movie that has the title 'Back to the Future'
            const query = {$and: [ { startMonth: { $lte:new Date(date)} }, { endMonth: {$gte : new Date(date)} }]};
            gallery = await galleryCollection.findOne(query) as GalleryDB;
            gallery = await this.associatePicturesToGallery(gallery)
        }
        finally {
            // Ensures that the client will close when you finish/error
            await client.close();
            return gallery
        }
    }

    async associatePicturesToGallery(gallery: GalleryDB) {
        let pictures : Picture[] = []
        if(gallery && gallery.pictureIds) {
            for (const pictureId of gallery.pictureIds) {
                console.log(pictureId)
                await this.getPictureById(pictureId).then((value : Picture) => {
                    pictures.push(value)
                })
            }
            gallery.pictures = pictures
            delete gallery.pictureIds
        }
        return gallery
    }
}

export default Picturesmongodb