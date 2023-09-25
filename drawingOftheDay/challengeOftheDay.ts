import {MongoDBClient} from "../dbConnection/MongoDBClient";
import { parse } from 'csv-parse';
const fs = require("fs");
const mongodbClient = new MongoDBClient();
import moment, {MomentInput} from "moment";

export const addChallengesToDatabase = (file: string, startDate: Date) => {
    let date : MomentInput = startDate;
    let formattedDate = moment(date).format(process.env.DATE_FORMAT);
    console.log("first date: " + date);
    fs.createReadStream(file)
        .pipe(parse({ delimiter: ",", from_line :2}))
        .on("data",  async (row : any) => {
            let wordOfTheDay = {
                japanese: row[0],
                english: row[1],
                date: new Date(formattedDate)
            }
            formattedDate = moment(formattedDate).add(1, 'd').format(process.env.DATE_FORMAT);
            try {
                await mongodbClient.addNewResource("challenges", wordOfTheDay);
            }
            catch (e) {
            }
        })
        .on("end", () => {
            console.log("finished");
        })
        .on("error",(error: Error) => {
            console.log(error.message);
        });
}
