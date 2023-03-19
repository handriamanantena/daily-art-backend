import {Artist, ArtistDB} from "../model/Artist";

import {collections} from "./dbConn";
import * as mongoDB from "mongodb";
import {Picture} from "../model/picture";


export class ArtistMongodb {


    async getArtistCollection() {
        return collections.artist;
    }


    async getArtistByEmail(email: string) : Promise<ArtistDB>{
        try{
            let artists = await this.getArtistCollection()
            if(artists == undefined) {
                console.error("artists collection missing");
                throw new Error("artists collection missing");
            }
            let artist : ArtistDB = await artists.findOne({email: email}) as ArtistDB
            return artist;
        }
        catch (e) {
            console.log("could not find artist error thrown")
            return {email: "", password: "", pictures: [], profilePicture: "", userName: "", _id: undefined};
        }
    }

    async getArtistByUserName(userName: string) : Promise<ArtistDB>{
        try{
            let artists = await this.getArtistCollection()
            if(artists == undefined) {
                console.error("artists collection missing");
                throw new Error("artists collection missing");
            }
            let artist : ArtistDB = await artists.findOne({userName: userName}) as ArtistDB
            return artist;
        }
        catch (e) {
            console.log("could not find artist error thrown")
            return {email: "", password: "", pictures: [], profilePicture: "", userName: "", _id: undefined};
        }
    }

    async addNewArtist(artist: Artist) {
        try{
            let artists = await this.getArtistCollection()
            if(artists == undefined) {
                console.error("artists collection missing");
                throw new Error("artists collection missing");
            }
            let response = await artists.insertOne(artist);
            return response;
        }
        catch (e) {
            console.log(e)
        }
    }


    async getArtistById(artistId : mongoDB.ObjectId) : Promise<ArtistDB>{
        try {
            let artists = await this.getArtistCollection()
            if(artists == undefined) {
                console.error("artists collection missing");
                throw new Error("artists collection missing");
            }

            let response = await artists.findOne(artistId).then(artist => {
                return artist as ArtistDB;
            })
            return response;
        }
        catch (e) {
            console.log(e)
            return { _id: undefined, email: "", password: "", pictures: [], profilePicture: "", userName: ""} ;
        }
    }
}