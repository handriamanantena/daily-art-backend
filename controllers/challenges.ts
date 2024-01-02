import {NextFunction, Request, Response} from "express";
import moment from "moment";
import {client as mongodbClient} from "../dbConnection/MongoDBConnection";
import {getResources} from "./genericApi";
import {ParsedQs} from "qs";


export async function getChallengeByDate (req: Request, res: Response, next: NextFunction) {
    let date : any = req.params.date;
    if(date == undefined) {
        date = moment().format(process.env.DATE_FORMAT);
    }
    else {
        date = moment(date).format(process.env.DATE_FORMAT);
    }
    console.log(date);
    let word = await mongodbClient.getOneResource("challenges", {date: new Date(date)});
    if(word) {
        res.status(200);
        return res.send(word);
    }
    else {
        res.status(404);
        return res.send({});
    }

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

export async function getChallenge(req: Request, res: Response, next: NextFunction) {
    let englishWord = decodeURIComponent(req.params.englishWord as string);
    let isPast = req.query.past as string;
    let words;
    if(isPast == "true") {
        let date = new Date();
        words = await mongodbClient.getOneResource("challenges", {$and :[{english: englishWord}, {date: {$lt: date}}]});
    }
    else {
        words = await mongodbClient.getOneResource("challenges", {english: englishWord});
    }
    if(words) {
        res.status(200);
        return res.send(words);
    }
    else {
        res.status(404);
        return res.send({});
    }
}
function setKeysForFilter(urlQuery : ParsedQs) : {[key: string]: any} {
    let filterKeys: {[key: string]: any} | undefined = {};
    return filterKeys;
}
async function getPage (pageIndex: string, pageSize: number, filterTerms : {[key: string]: any}, searchText: string, fields: {[key: string]: 1|0}) {
    console.log("Date: " + new Date(pageIndex));
    let lookup = {$lookup: {
            from: "pictures",
            //let: { englishPictures: {$arrayElemAt:[{ $split: ["$dailyChallenge", "/"]}, 0]}},
            //let: { word: { $split: ["$dailyChallenge", "/"]}},
            let: {english: {$toString: "$english"}},
            pipeline : [
                //{ $match: { $expr:{$in: ["$english", {$ifNull: [{ $split: ["$dailyChallenge", "/"]}, []]}]}}},
                { $match: { $expr:{$in: ["$$english", {$ifNull: [{ $split: ["$dailyChallenge", "/"]}, []]}]}}},
                {$project : { url : 1, pictureName: 1}} //TODO need to customize projection
            ],
            as: "pictures"
        }};
    return await mongodbClient.getAggregateCustomLookup("challenges", "date", new Date(pageIndex), pageSize,
        filterTerms, searchText, fields, lookup);
}