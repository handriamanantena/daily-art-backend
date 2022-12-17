import * as mongoDB from "mongodb";
import {Picture} from "../model/picture";
import {Artist} from "../model/Artist";

const uri =
    "mongodb://127.0.0.1:27017/?readPreference=primary&serverSelectionTimeoutMS=2000&appname=MongoDB%20Compass&directConnection=true&ssl=false";
const client: mongoDB.MongoClient = new mongoDB.MongoClient(uri);

export class ArtistMongodb {


    async getArtistCollection() {
        await client.connect();
        const database = client.db('Art');
        return database.collection('artist');
    }


    async getArtistByEmail(email: string) {
        try{
            let artists = await this.getArtistCollection()
            let artist = await artists.findOne({email: email}) as Artist
            return artist;
        }
        finally {
            await client.close()
        }
    }

    async addNewArtist(artist: Artist) {
        try{
            let artists = await this.getArtistCollection()
            let response = await artists.insertOne(artist)
            return response;
        }
        finally {
            await client.close()
        }
    }




}