import {NextFunction, Request, Response} from "express";
import {Picture, PictureDB} from "../model/picture";
import {Picturesmongodb} from "./picturesmongodb";
import {MongoDBClient} from "../dbConnection/MongoDBClient";
import * as mongoDB from "mongodb";
import {ObjectId} from "mongodb";
import {getResources, splitFields} from "./genericApi";
import {ParsedQs} from "qs";
import {checkFields} from "../common/parser/genericTypeCheck";
import {DeleteResult} from "mongodb";
import {InsertOneResult} from "mongodb";
import moment from "moment";
import {Utility} from "../common/utility";
const mongoDBClient = new MongoDBClient();
const pictureMongodb = new Picturesmongodb();
const utility = new Utility();


export async function filterPictures (req: Request, res: Response, next: NextFunction) {
    let urlQuery = req.query;
    let query = {};
    console.log(urlQuery);
    if(urlQuery) {
        let id = urlQuery.id as string;
        let date = urlQuery.date as string;
        let search = urlQuery.search as string;
        let pageIndex = urlQuery.pageIndex as string;
        let pageSize = +(urlQuery.pageSize as string);
        let artistId = urlQuery.artist as string;
        let userName = urlQuery.userName as string;
        let fields = urlQuery.fields as string;
        if(id != undefined && id != "") {
            query = {_id: new ObjectId(id)};
            let picture : Picture = await mongoDBClient.getOneResource<PictureDB>("pictures", query);
            if(picture) {
                return res.send(picture);
            }
            else {
                res.status(404);
                return res.send();
            }
        }
        else if(pageSize){
            let pictures: Picture[];

            if(search && pageIndex) {
                pictures = await mongoDBClient.getResourcePage("pictures",
                    {$and: [{_id: {$gt: new ObjectId(pageIndex)}},  { $text: { $search: search }}]}, pageSize, {});
            }
            else if(search) {
                pictures = await mongoDBClient.getResourcePage("pictures",
                    {$text: { $search: search }}, pageSize, {});
            }
            else if(date) { //example date 2023-04-15T20:57:15.729%2B00:00
                pictures = await mongoDBClient.getResourcePage("pictures",
                    { date: { $lt: new Date(date)}}, pageSize, {date: -1});
                console.log(date)
            }
            else if(artistId || userName) {
                return getPicturesByArtist(req, res, next);
            }
            else {
                pictures = await mongoDBClient.getResourcePage("pictures", {}, pageSize, {_id : -1});
            }
            if(pictures && pictures.length > 0) {
                return res.send(pictures);
            }
            else {
                res.status(404);
                return res.send([]);
            }
        }
        else if(date) {
            console.log(date)
            query = { date: {
                    $gt: new Date(date),
                    $lt: new Date()
                }};
            let pictures: Picture[] = await mongoDBClient.getResources("pictures", query, {}, {}, undefined);
            if(pictures) {
                return res.send(pictures);
            }
            else {
                res.status(404);
                return res.send();
            }
        }
        else if(artistId) {
            return getPicturesByArtist(req, res, next); // TODO need to simply if statements
        }
        else { // TODO need to refactor this to not return all picture data
            let pictures: Picture[] = await mongoDBClient.getResources("pictures", {}, {}, {}, undefined);
            return res.send(pictures);
        }
    }
    /*const query1 = {$and: [ { startMonth: { $lte:new Date(date)} }, { endMonth: {$gte : new Date(date)} }]};

    let pictures = await mongoDBClient.getResources("pictures", query);
    console.log(pictures);
    res.send();*/
}

export async function getPicturesByArtist(req: Request, res: Response, next: NextFunction) {
    let urlQuery = req.query;
    console.log("getPicturesByArtist");
    if(urlQuery) {
        let artistId = urlQuery.artist as string;
        let userName = urlQuery.userName as string;
        let artist;
        let pictures;
        if(urlQuery.pageIndex != undefined && urlQuery.pageSize != undefined) {
            let pageIndex = +(urlQuery.pageIndex as string);
            let pageSize = +(urlQuery.pageSize as string);
            let cursor;
            if(artistId) {
                console.log("artistId");
                cursor = await mongoDBClient.getResourcesProjection("artist",
                    {_id: new ObjectId(artistId)}, {pictures: {$slice: [pageIndex, pageSize]}});
            }
            else if(userName) {
                console.log("userName");
                cursor = await mongoDBClient.getResourcesProjection("artist",
                    {userName: userName}, {pictures: {$slice: [pageIndex, pageSize]}});
            }
            if(cursor) {
                for await (const doc of cursor) {
                    if (doc) {
                        artist = doc;
                        console.log("the picture ids" + JSON.stringify(artist.pictures));
                        break;
                    }
                }
            }
        }
        else {
            artist = await mongoDBClient.getOneResource<PictureDB>("artist", {_id: new ObjectId(artistId)});
        }
        pictures = await mongoDBClient.getResources("pictures", {_id: {$in: artist.pictures}}, {}, {}, undefined);
        if(pictures) {
            return res.send(pictures);
        }
        else {
            res.status(404);
            return res.send();
        }
    }
}

/*export async function getPictures (req: Request, res: Response, next: NextFunction) {
    let date = req.query.date as string
    let name = req.query.name as string
    if(date) {
        pictureMongodb.getPicturesByDate(new Date(date)).then((value => {
            if(value) {
                res.send(value)
            }
            else {
                res.status(404)
                res.send({value: 'not found'})
            }

        })).catch(e => {
            console.log(e)
            res.send(e)
        })
    }
    let page = req.query.page
    if(page) {
        let pageNumber = Number(page);
        console.log('inside')
        pictureMongodb.getGalleryByPage(pageNumber).then((value => {
            if(value) {
                res.send(value)
            }
            else {
                res.status(404)
                res.send({value: 'not found'})
            }

        })).catch(e => {
            console.log(e)
            res.send(e)
        })
    }
    else if(name) {
        pictureMongodb.getPictureByName(name).then(((value: Picture) => {
                if(value) {
                    res.send(value)
                }
                else {
                    throw new Http404Error({
                        error: {
                            message: "picture not found",
                            innerError: {}
                        }
                    })
                }
            }
        )).catch((e : Error) => {
            next(e)
        })
    }
    else {
        pictureMongodb.getAllPictures().then((value => {
            if(value) {
                res.send(value)
            }
            else {
                res.status(404)
                res.send({value: 'pictures not found'})
            }

        })).catch(e => {
            console.log("error getting picture")
            res.send(e)
        })
    }
}*/

export async function getPictureWithUserInfo (req: Request, res: Response, next: NextFunction) {
    let pictureId = req.params.pictureId;
    let fields = {};
    if(req.query.fields != undefined)
        fields = splitFields(req.query.fields as string);
    /*let artistProjection : {[key: string]: 1|0 } = {};
    artistProjection["userName"] = 1;
    artistProjection["profilePicture"] = 1;*/
    let artistProjection = {};
    if(req.query.artistProjection != undefined)
        artistProjection = splitFields(req.query.artistProjection as string);
    //"userName" : 1, "profilePicture" : 1
    let objectId = utility.fromStringToMongoId(pictureId);
    let array =  await mongoDBClient.getAggregateOneResource("pictures", "artist", "userName", "userName", objectId,
        "profile", fields, artistProjection);
    if(array.length == 0) {
        res.status(404);
        return res.send([]);
    }
    else {
        return res.send(array[0]);
    }

    //return await mongoDBClient.getOneResource("pictures", {_id: new ObjectId(pictureId)});
}

export async function addReplyToPicture (req: Request, res: Response, next: NextFunction) {
    let pictureId = req.query.pictureId as string
    pictureMongodb.insertReplyOnPicture(req.body, pictureId).then(value => {
        res.send(value)
    }).catch(e => {
        console.log(e)
        next(e)
    })
}

export async function addPicture (req: Request, res: Response, next: NextFunction) {
    let picture: Picture = req.body as Picture;
    let missingFields;
    try {
        console.log("checking fields")
        missingFields = checkFields(picture);
        if (missingFields != "") {
            throw new Error("Bad input, fields missing: " + missingFields);
        }
        picture.date = new Date();
        picture.userName = res.locals.token.userName;
    }
    catch (e) {
        console.error("missing fields: missingFields");
        console.error(e);
        res.status(400);
        return res.send("Bad input, fields missing: " + missingFields);
    }
    console.log("adding picture to db")
    let pictureResponse = await addPictureToDB(picture);
    console.log("db response: " + JSON.stringify(pictureResponse));
    if (pictureResponse.acknowledged) {
        // TODO need to add file extension
        let updateStatus = await mongoDBClient.updateResource("pictures", {_id: new mongoDB.ObjectId(pictureResponse.insertedId)}, {$set: {url: pictureResponse.insertedId.toString()}}, {upsert: false});
        if (updateStatus.modifiedCount == 1) {
            res.status(201);
        }
        else {
            // TODO need to delete picture
        }
    }
    else {
        res.status(500);
    }
    return res.send(pictureResponse);

}

export async function deletePicture(req: Request, res: Response, next: NextFunction) { // TODO need to authorize user first with jwt token
   let pictureId = req.params.pictureId as string;
   let objectId = utility.fromStringToMongoId(pictureId);
   let picture : PictureDB = await mongoDBClient.getOneResource<PictureDB>("pictures", {_id: objectId});
   if(picture) {
       if(picture.userName == res.locals.token.userName) {
           let result : DeleteResult = await mongoDBClient.deleteOneResource("pictures", {_id: objectId});
           if(result.deletedCount == 1) {
               res.status(200);
               return res.send(result);
           }
           else {
               res.status(500);
               console.error("failed to delete image id " + req.body.pictureId);
               return res.send(result);
           }
       }
       else {
           res.status(401);
           return res.send("Unauthorized to delete picture");
       }
   }
   else {
       res.status(404);
       return res.send("picture not found");
   }

}

export async function getPictures (req: Request, res: Response, next: NextFunction) {
    let pictures = await getResources(req, res, next, setKeysForFilter, getPage);
    if(pictures) {
        res.status(200);
        return res.send(pictures);
    }
    else {
        res.status(404);
        return res.send([]);
    }
}

export async function getOnePicture (req: Request, res: Response, next: NextFunction) {
    let id = utility.fromStringToMongoId(req.params.id)
    let picture = await mongoDBClient.getOneResource("pictures", {_id: id});
    if(picture) {
        res.status(200);
        return res.send(picture);
    }
    else {
        res.status(404);
        return res.send();
    }
}

export async function updatePicture (req: Request, res: Response, next: NextFunction) {
    let pictureId = req.params.pictureId as string;
    let objectId = utility.fromStringToMongoId(pictureId);
    if(objectId == undefined) {
        res.status(404);
        return res.send("Picture not found");
    }
    let picture : PictureDB = await mongoDBClient.getOneResource<PictureDB>("pictures",{_id : objectId});
    if(picture.userName == res.locals.token.userName) {
        let updates = { $set : req.body};
        console.log(updates);
        delete updates.$set.userName;
        let updateResult = await mongoDBClient.updateResource("pictures", {_id: objectId}, updates, {upsert: false});
        if(updateResult.modifiedCount == 1 || updateResult.acknowledged) {
            res.status(200);
            return res.send("update success");
        }
        else {
            res.status(404);
            return res.send("Picture not found");
        }
    }
    else {
        res.status(409);
        return res.send("Unauthorized");
    }
}


function setKeysForFilter(urlQuery : ParsedQs) : {[key: string]: any} {
    let date = urlQuery.date as string;
    let artist = urlQuery.artist as string;
    let userName = urlQuery.userName as string;
    let dailyChallenge = urlQuery.dailyChallenge as string;
    let filterKeys: {[key: string]: any} | undefined = {};
    if(date) {
        filterKeys.date = { $lt: new Date(date)};
    }
    else if(artist) {
        filterKeys.artist = artist;
    }
    else if(userName) {
        filterKeys.userName = userName;
    }
    else if(dailyChallenge) {
        filterKeys.dailyChallenge = decodeURIComponent(dailyChallenge);
    }
    /*let artistId = urlQuery.artist as string;
    let userName = urlQuery.userName as string;
    let filterKeys: {[key: string]: any} = {};
    if(date) {
        filterKeys.date = new Date(date);
    }
    else if(artistId) {
        try {
            filterKeys._id = new ObjectId(artistId);
        }
        catch (e) {
            console.error(e);
            throw e;
        }
    }
    else if(userName) {
        filterKeys.userName = userName;
    }*/
    return filterKeys;

}
async function getPage(pageIndex: string, pageSize: number, filterTerms : {[key: string]: any}, searchText: string, fields: {[key: string]: 1|0}) {
       /* let cursor;
        if(filterTerms.artiist) {
            let artistId;
            try{
                artistId = new ObjectId(filterTerms.artiist);
            }
            catch (e) {
                console.error("bad artistId {}", artistId);
                throw e;
            }
            cursor = await mongoDBClient.getResourcesProjection("artist",
                {_id: new ObjectId(artistId)}, {pictures: {$slice: [pageIndex, pageSize]}});
        }
        else if(filterTerms.userName) {
            console.log("userName");
            cursor = await mongoDBClient.getResourcesProjection("artist",
                {userName: filterTerms.userName}, {pictures: {$slice: [pageIndex, pageSize]}});
        }
        if(cursor) {
            for await (const doc of cursor) {
                if (doc) {
                    artist = doc;
                    console.log("the picture ids" + JSON.stringify(artist.pictures));
                    break;
                }
            }
        }
        pictures = await mongoDBClient.getResources<mongoDB.ObjectId>("pictures",
            {_id: {$in: artist.pictures}}, {});

    else {*/
        //return await mongoDBClient.getResourceByPage("pictures", pageIndex, pageSize, filterTerms, searchText, fields);
        return await mongoDBClient.getAggregate("pictures", "artist", "userName", "userName", "profile", "profilePicture",
            "_id", pageIndex, pageSize, filterTerms, searchText, fields);
   // }
}

export async function addPictureToDB(picture : Picture) : Promise<InsertOneResult>{
    console.log("getting dates");
    let dates : {date : Date | {}}[] = await mongoDBClient.getResources("pictures", {userName: picture.userName}, {date: 1, _id: 0}, {date: -1}, 1);
    console.log("these are the dates: " + JSON.stringify(dates));
    let date1 = moment(dates[0]?.date);
    let todayDate = moment();
    console.log(JSON.stringify(todayDate));
    let diff;
    if (dates.length == 0) {
        diff = -1;
    }
    else {
        diff = todayDate.diff(date1, "days");
    }
    console.log("diff: " + diff);
    let update;
    if (diff == 1) {
        console.log("diff == 1")
        update = await mongoDBClient.updateResource("artist", {userName: picture.userName}, {$inc: {streak: 1}}, {upsert: false});
    }
    else if (diff > 1 || diff == -1) {
        console.log("diff > 1 || diff == -1");
        update = await mongoDBClient.updateResource("artist", {userName: picture.userName}, {$set: {streak: 1}}, {upsert: false});
    }
    console.log("upate in artist collection: " + update);
    let pictureResponse = await mongoDBClient.createResource("pictures", picture);
    console.log("update in picture collection" + pictureResponse);
    return pictureResponse;
}
