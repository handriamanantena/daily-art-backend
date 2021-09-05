const { MongoClient } = require("mongodb");

const uri =
    "mongodb://127.0.0.1:27017/?readPreference=primary&serverSelectionTimeoutMS=2000&appname=MongoDB%20Compass&directConnection=true&ssl=false";
const client = new MongoClient(uri);

class Picturesmongodb {

    async getPicture(pictureName) {
        let picture = ''
        try {
            console.log(pictureName)
            await client.connect();
            const database = client.db('Art');
            const pictures = database.collection('pictures');
            // Query for a movie that has the title 'Back to the Future'
            const query = {url: pictureName};
            picture = await pictures.findOne(query);
            console.log(picture);
        } finally {
            // Ensures that the client will close when you finish/error
            await client.close();
            console.log(picture);
            return picture
        }
    }
}

module.exports = Picturesmongodb