import {NextFunction, Request, Response} from "express";
import moment from "moment";
import {MongoDBClient} from "../dbConnection/MongoDBClient";
import {getResources} from "./genericApi";
import {ParsedQs} from "qs";
const mongodbClient = new MongoDBClient();


export async function getChallengeByDate (req: Request, res: Response, next: NextFunction) {
    let date : any = req.params.date;
    if(date == undefined) {
        date = moment().format(process.env.DATE_FORMAT);
    }
    else {
        date = moment(date).format(process.env.DATE_FORMAT);
    }
    console.log(date);
    let word = await mongodbClient.getOneResource("challenges", {date});
    return res.send(word);

}

export async function getWordsPage (req: Request, res: Response, next: NextFunction) {
    let words = await getResources(req, res, next, setKeysForFilter, getPage);
    if(words) {
        res.status(200);
        return res.send(words);
    }
    else {
        res.status(404);
        return res.send([]);
    }
}
function setKeysForFilter(urlQuery : ParsedQs) : {[key: string]: any} {
    let filterKeys: {[key: string]: any} | undefined = {};
    return filterKeys;
}
async function getPage (pageIndex: string, pageSize: number, filterTerms : {[key: string]: any}, searchText: string, fields: {[key: string]: 1|0}) {
    console.log("Date: " + new Date(pageIndex));
    return await mongodbClient.getAggregate("challenges", "pictures", "date", "date",
        "pictures", "url", "date",  new Date(pageIndex), pageSize, filterTerms, searchText, fields);
}