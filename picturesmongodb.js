const { MongoClient, ObjectId} = require("mongodb");

const uri =
    "mongodb://127.0.0.1:27017/?readPreference=primary&serverSelectionTimeoutMS=2000&appname=MongoDB%20Compass&directConnection=true&ssl=false";
const client = new MongoClient(uri);

class Picturesmongodb {

    async getPictureByName(pictureName) {
        let picture = ''
        try {
            await client.connect();
            const database = client.db('Art');
            const pictures = database.collection('pictures');
            // Query for a movie that has the title 'Back to the Future'
            const query = {url: pictureName};
            picture = await pictures.findOne(query);
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
            return picture
        }
    }

    async getPictureById(id) {
        let picture = {}
        try {
            await client.connect();
            const database = client.db('Art');
            const pictures = database.collection('pictures');
            const query = id;
            picture = await pictures.findOne(query);
        }
        finally {
            await client.close();
            return picture
        }
    }

    async getPicturesByIndex() {
        let pictures = []
    }

    async getPicturesByDate(date) {
        let gallery
        try {
            await client.connect();
            const database = client.db('Art');
            const galleryCollection = database.collection('gallery');
            // Query for a movie that has the title 'Back to the Future'
            const query = {$and: [ { startMonth: { $lte:new Date(date)} }, { endMonth: {$gte : new Date(date)} }]};
            gallery = await galleryCollection.findOne(query);
            console.log(gallery)
            let pictures = []
            for (const pictureId of gallery.pictures) {
                await this.getPictureById(pictureId).then(value => {
                    pictures.push(value)
                })
            }
            gallery.pictures = pictures
        }
        finally {
            // Ensures that the client will close when you finish/error
            await client.close();
            return gallery
        }
    }
}

module.exports = Picturesmongodb