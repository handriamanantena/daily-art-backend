import {closeConnection, collections, connectToDatabase} from "../../dbConnection/dbConn";

import {MongoDBClient} from "../../dbConnection/MongoDBClient";
const mongoDBClient = new MongoDBClient();
import {picturesDB} from "./pictureArray";
import {Picture} from "../../model/picture";
// @ts-ignore
describe('test get api', () => {
    let connection;
    let db;

    // @ts-ignore
    beforeAll(async () => {
        // @ts-ignore
        /*connection = await MongoClient.connect(global.__MONGO_URI__, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });*/
        const uri = global.__MONGO_URI__;
        await connectToDatabase(uri, {
        }, globalThis.__MONGO_DB_NAME__);

        const pictureCollection = collections.pictures;

        await pictureCollection?.insertMany(picturesDB);
    });

    // @ts-ignore
    afterAll(async () => {
        await closeConnection();
    });

    test('get 1 picture', async () => {
        let pictures = await mongoDBClient.getResourceByPage("pictures", "", 1, {pictureName : "Madara"}, "", {});
        expect(pictures[0].pictureName).toEqual("Madara");
    });

    test('Test get 0 picture', async () => {
        let pictures = await mongoDBClient.getResourceByPage("pictures", "", 1, {pictureName : "no name"}, "", {});
        expect(pictures.length).toEqual( 0);
    });

    test('Test get first 3 pictures', async () => {
        let pictures : Picture[] = await mongoDBClient.getResourceByPage("pictures", "", 3, {}, "", {}) as Picture[];
        expect(pictures.length).toEqual( 3);
        console.log(pictures);
        expect(pictures[0]._id?.toHexString()).toEqual("6467d2a9f0067f9f2733bd6f");
        expect(pictures[1]._id?.toHexString()).toEqual("64266401aab09ef5642b3036");
        expect(pictures[2]._id?.toHexString()).toEqual("642663fdaab09ef5642b3035");
    });

    test('Test get first 3 pictures with filter, but only return 2', async () => {
        let pictures : Picture[] = await mongoDBClient.getResourceByPage("pictures", "6136f5ce67c9c0458ef84686", 3, { date: { $lt: new Date("2023-04-16T03:15:21.329Z")}}, "", {}) as Picture[];
        let picture = await collections.pictures?.findOne({});
        expect(pictures.length).toEqual( 2);
        expect(pictures[0]._id?.toHexString()).toEqual("6136f49367c9c0458ef84685");
        expect(pictures[1]._id?.toHexString()).toEqual("613012d4d165b61ffc1896f6");
    });

    test('Test get first 3 pictures with filter', async () => {
        let pictures : Picture[] = await mongoDBClient.getResourceByPage("pictures", "642663e0aab09ef5642b302e", 3, { date: { $lt: new Date("2023-04-16T03:15:29.388Z")}}, "", {}) as Picture[];
        console.log(JSON.stringify(pictures));
        expect(pictures.length).toEqual( 3);
        expect(pictures[0]._id?.toHexString()).toEqual("642663dcaab09ef5642b302d");
        expect(pictures[1]._id?.toHexString()).toEqual("642663d7aab09ef5642b302c");
        expect(pictures[2]._id?.toHexString()).toEqual("642663c4aab09ef5642b302b");
    });
});