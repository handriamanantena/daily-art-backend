import {connection, client} from "../../dbConnection/MongoDBConnection";
import {artistDB} from "./artistArray";
import {picturesDB} from "./pictureArray";
import {InsertOneResult} from "../../adapters/database/MongoDB";
import {Picture, PictureDB} from "../../model/picture";
import {Artist, ArtistDB} from "../../model/Artist";
import {Collection} from "../../adapters/database/MongoDB";
import moment from "moment";
import {addPictureToDB} from "../../controllers/pictures";
// @ts-ignore
describe('test insert picture', () => {

    let artistCollection : Collection | undefined;
    let pictureCollection: Collection | undefined;

    beforeAll(async () => {
        // @ts-ignore
        const uri = global.__MONGO_URI__;
        // @ts-ignore
        await connection.connectToDatabase(uri, {}, globalThis.__MONGO_DB_NAME__);

    });

    beforeEach(async  () => {
        artistCollection = await client.mongoDB.getCollection("artist");
        pictureCollection = await client.mongoDB.getCollection("pictures");
        await artistCollection?.deleteMany({})
        await pictureCollection?.deleteMany({})
        await artistCollection?.insertMany(artistDB);
        await pictureCollection?.insertMany(picturesDB);
    });


    afterAll(async () => {
        await connection.closeConnection();
    });

    test('Test insert first picture first', async () => {
        let pictureResult : InsertOneResult = await addPictureToDB({
            pictureName: "unique test name",
            date: new Date(),
            userName: "username3"
        });

        let picture : Picture = await pictureCollection?.findOne({pictureName: "unique test name"}) as PictureDB;
        let artist: Artist = await artistCollection?.findOne({userName: "username3"}) as ArtistDB;
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

        let picture : Picture = await pictureCollection?.findOne({pictureName: "unique test name"}) as PictureDB;
        let artist: Artist = await artistCollection?.findOne({userName: "username2"}) as ArtistDB;
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

        let picture : Picture = await pictureCollection?.findOne({pictureName: "test insert"}) as PictureDB;
        let artist: Artist = await artistCollection?.findOne({userName: "username2"}) as ArtistDB;
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

        let picture : Picture = await pictureCollection?.findOne({pictureName: "test insert"}) as PictureDB;
        let artist: Artist = await artistCollection?.findOne({userName: "username4"}) as ArtistDB;
        expect(pictureResult.acknowledged).toEqual(true);
        expect(picture.userName).toEqual("username4");
        expect(artist.streak).toEqual(3);
    });

});