import {NextFunction, Request, Response} from "express";
import moment from "moment";
import {MongoDBClient} from "../dbConnection/MongoDBClient";
const mongodbClient = new MongoDBClient();


export async function getWordByDate (req: Request, res: Response, next: NextFunction) {
    let date : any = req.params.date;
    if(date == undefined) {
        date = moment().format(process.env.DATE_FORMAT);
    }
    else {
        date = moment(date).format(process.env.DATE_FORMAT);
    }
    console.log(date);
    let word = await mongodbClient.getOneResource("words", {date});
    return res.send(word);

}