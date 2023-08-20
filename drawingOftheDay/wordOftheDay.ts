import {MongoDBClient} from "../dbConnection/MongoDBClient";
import { parse } from 'csv-parse';
const fs = require("fs");
const mongodbClient = new MongoDBClient();
import moment, {MomentInput} from "moment";

export const addWordsToDatabase = (file: string, startDate: Date) => {
    let date : MomentInput = startDate;
    let count = 0;
    fs.createReadStream(file)
        .pipe(parse({ delimiter: ",", from_line :2}))
        .on("data",  async (row : any) => {
            date = moment(date).add(1, 'd').format("YYYY-MM-DD");
            count = count + 1;
            //console.log("count inside " + count);
            let wordOfTheDay = {
                japanese: row[0],
                english: row[1],
                date: date
            }
            try {
                await mongodbClient.addNewResource("words", wordOfTheDay);
            }
            catch (e) {
                console.log("Already inserted word");
            }
        })
        .on("end", () => {
            console.log("finished");
        })
        .on("error",(error: Error) => {
            console.log(error.message);
        });
}
