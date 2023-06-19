import {Picture} from "../model/picture";
import {MongoDBClient} from "./MongoDBClient";
import moment from "moment";
import {InsertOneResult} from "mongodb";
const mongoDBClient = new MongoDBClient();


export async function addPictureToDB(picture : Picture) : Promise<InsertOneResult>{
    let dates : {date : Date | {}}[] = await mongoDBClient.getResources("pictures", {userName: picture.userName}, {date: 1, _id: 0}, {date: -1}, 1);
    let date1 = moment(dates[0]?.date);
    let todayDate = moment();
    let diff;
    if (dates.length == 0) {
        diff = -1;
    }
    else {
        diff = todayDate.diff(date1, "days");
    }
    let update;
    if (diff == 1) {
        update = await mongoDBClient.updateResource("artist", {userName: picture.userName}, {$inc: {streak: 1}});
    }
    else if (diff > 1 || diff == -1) {
        update = await mongoDBClient.updateResource("artist", {userName: picture.userName}, {$set: {streak: 1}});
    }
    console.log("upate in artist collection: " + update);
    let pictureResponse = await mongoDBClient.createResource("pictures", picture);
    console.log("update in picture collection" + pictureResponse);
    return pictureResponse;
}