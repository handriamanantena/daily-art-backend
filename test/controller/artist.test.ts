import {closeConnection, collections, connectToDatabase} from "../../dbConnection/dbConn";
import {artistDB} from "./artistArray";
import {picturesDB} from "./pictureArray";
import {InsertOneResult} from "mongodb";
import {Picture} from "../../model/picture";
import {Artist} from "../../model/Artist";
import * as mongoDB from "mongodb";
import moment from "moment";
import {addPictureToDB} from "../../controllers/pictures";
// @ts-ignore
describe('test insert picture', () => {

    let artistCollection : mongoDB.Collection | undefined;
    let pictureCollection: mongoDB.Collection | undefined;

    beforeAll(async () => {
        // @ts-ignore
        const uri = global.__MONGO_URI__;
        // @ts-ignore
        await connectToDatabase(uri, {}, globalThis.__MONGO_DB_NAME__);

    });

    beforeEach(async  () => {
        artistCollection = collections.artist;
        pictureCollection = collections.pictures;
        await artistCollection?.deleteMany({})
        await pictureCollection?.deleteMany({})
        await artistCollection?.insertMany(artistDB);
        await pictureCollection?.insertMany(picturesDB);
    });


    afterAll(async () => {
        await closeConnection();
    });

    test('Test insert first picture first', async () => {
        let pictureResult : InsertOneResult = await addPictureToDB({
            pictureName: "unique test name",
            date: new Date(),
            userName: "username3"
        });
        console.log(pictureResult);

        let picture : Picture = await pictureCollection?.findOne({pictureName: "unique test name"}) as Picture;
        console.log(picture);
        let artist: Artist = await artistCollection?.findOne({userName: "username3"}) as Artist;
        expect(pictureResult.acknowledged).toEqual(true);
        expect(picture.userName).toEqual("username3");
        expect(artist.streak).toEqual(1);
    });

    test('Test insert second picture, but no streak and streak already 1', async () => {
        let pictureResult : InsertOneResult = await addPictureToDB({
            pictureName: "unique test name",
            date: new Date(),
            userName: "username2"
        });
        console.log(pictureResult);

        let picture : Picture = await pictureCollection?.findOne({pictureName: "unique test name"}) as Picture;
        console.log(picture);
        let artist: Artist = await artistCollection?.findOne({userName: "username2"}) as Artist;
        expect(pictureResult.acknowledged).toEqual(true);
        expect(picture.userName).toEqual("username2");
        expect(artist.streak).toEqual(1);
    });

    test('Test insert second picture and increase streak and streak already 1', async () => {
        let yesterday =  moment().subtract(1, 'days');
        await pictureCollection?.insertOne({
            "pictureName": "test insert",
            "date": yesterday.toDate(),
            "userName": "username2"
        });
        let pictureResult : InsertOneResult = await addPictureToDB({
            pictureName: "unique test name",
            date: new Date(),
            userName: "username2"
        });
        console.log(pictureResult);

        let picture : Picture = await pictureCollection?.findOne({pictureName: "test insert"}) as Picture;
        console.log(picture);
        let artist: Artist = await artistCollection?.findOne({userName: "username2"}) as Artist;
        expect(pictureResult.acknowledged).toEqual(true);
        expect(picture.userName).toEqual("username2");
        expect(artist.streak).toEqual(2);
    });

    test('Test insert second picture and increase streak, but streak is 2', async () => {
        let yesterday =  moment().subtract(1, 'days');
        await pictureCollection?.insertOne({
            "pictureName": "test insert",
            "date": yesterday.toDate(),
            "userName": "username4"
        });
        let pictureResult : InsertOneResult = await addPictureToDB({
            pictureName: "unique test name",
            date: new Date(),
            userName: "username4"
        });
        console.log(pictureResult);

        let picture : Picture = await pictureCollection?.findOne({pictureName: "test insert"}) as Picture;
        console.log(picture);
        let artist: Artist = await artistCollection?.findOne({userName: "username4"}) as Artist;
        expect(pictureResult.acknowledged).toEqual(true);
        expect(picture.userName).toEqual("username4");
        expect(artist.streak).toEqual(3);
    });

});