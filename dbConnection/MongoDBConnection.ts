import {addChallengesToDatabase} from "../drawingOftheDay/challengeOftheDay";
import {DBConnection} from "./DBConnection";
import {MongoDB, MongoDBConnectionOptions} from "../adapters/database/MongoDB";

export class MongoDBConnection extends DBConnection {

    mongoDB : MongoDB = new MongoDB();

    async connectToDatabase(uri: string, connectionOptions: MongoDBConnectionOptions, dbName: string) {
        await this.mongoDB.connectToDatabase(uri, connectionOptions, dbName);
    }

    async closeConnection() {
        await this.mongoDB.closeConnection();
    }

    async initializeCollections() {
        await this.configureIndexes();
        await addChallengesToDatabase(process.env.CSV_WORDS_FILE!, new Date(process.env.WORDS_START_DATE!));
    }

    private async configureIndexes() {
        await this.mongoDB.createIndex("pictures", { pictureName : "text", tags : "text", artistUsername: "text"}, { default_language: "english" });
        await this.mongoDB.createIndex("pictures", { date : 1});

        await this.mongoDB.createIndex("artist", { userName : 1}, { unique: true});
        await this.mongoDB.createIndex("artist", { email : 1}, { unique: true});

        await this.mongoDB.createIndex("challenges", {japanese: 1}, {unique: true});
        await this.mongoDB.createIndex("challenges", {english: 1}, {unique: true});
    }

}
