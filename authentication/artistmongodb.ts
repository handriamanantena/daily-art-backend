import {Artist} from "../model/Artist";

import {collections} from "../dbConnection/dbConn";


export class ArtistMongodb {


    async getArtistCollection() {
        return collections.artist;
    }


    async getArtistByEmail(email: string) {
        try{
            let artists = await this.getArtistCollection()
            if(artists == undefined) {
                console.error("artists collection missing");
                throw new Error("artists collection missing");
            }
            let artist = await artists.findOne({email: email}) as Artist
            return artist;
        }
        catch (e) {
            console.log(e)
        }
    }

    async addNewArtist(artist: Artist) {
        try{
            let artists = await this.getArtistCollection()
            if(artists == undefined) {
                console.error("artists collection missing");
                throw new Error("artists collection missing");
            }
            let response = await artists.insertOne(artist)
            return response;
        }
        catch (e) {
            console.log(e)
        }
    }




}