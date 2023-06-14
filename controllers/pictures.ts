import express, {NextFunction, Request, Response} from "express";
import {Picture, PictureDB} from "../model/picture";
import {Http404Error} from "../error/HttpErrors";
import {collections} from "../dbConnection/dbConn";
import {Picturesmongodb} from "../picturesmongodb";
import {MongoDBClient} from "../dbConnection/MongoDBClient";
import * as mongoDB from "mongodb";
import {ObjectId} from "mongodb";
import {Artist} from "../model/Artist";
import {getResources} from "./genericApi";
import {ParsedQs} from "qs";
import {Comment} from "../model/Comment";
import {checkFields} from "../common/parser/genericTypeCheck";
const mongoDBClient = new MongoDBClient();
const pictureMongodb = new Picturesmongodb();



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
                pictures = await mongoDBClient.getResourcePage<Picture>("pictures",
                    {$and: [{_id: {$gt: new ObjectId(pageIndex)}},  { $text: { $search: search }}]}, pageSize, {});
            }
            else if(search) {
                pictures = await mongoDBClient.getResourcePage<Picture>("pictures",
                    {$text: { $search: search }}, pageSize, {});
            }
            else if(date) { //example date 2023-04-15T20:57:15.729%2B00:00
                pictures = await mongoDBClient.getResourcePage<Picture>("pictures",
                    { date: { $lt: new Date(date)}}, pageSize, {date: -1});
                console.log(date)
            }
            else if(artistId || userName) {
                return getPicturesByArtist(req, res, next);
            }
            else {
                pictures = await mongoDBClient.getResourcePage<Picture>("pictures", {}, pageSize, {_id : -1});
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
            let pictures: Picture[] = await mongoDBClient.getResources<Picture>("pictures", query, {});
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
            let pictures: Picture[] = await mongoDBClient.getResources<Picture>("pictures", {}, {});
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
            artist = await mongoDBClient.getOneResource<Picture>("artist", {_id: new ObjectId(artistId)});
        }
        pictures = await mongoDBClient.getResources<mongoDB.ObjectId>("pictures",
            {_id: {$in: artist.pictures}}, {});
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

export async function getPicture (req: Request, res: Response, next: NextFunction) {
    let pictureId = req.params.id
    console.log(pictureId);
    pictureMongodb.getPictureById(pictureId).then(((value: Picture) => {
            console.log('outside', value)
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

export async function addReplyToPicture (req: Request, res: Response, next: NextFunction) {
    let pictureId = req.query.pictureId as string
    pictureMongodb.insertReplyOnPicture(req.body, pictureId).then(value => {
        res.send(value)
    }).catch(e => {
        console.log(e)
        next(e)
    })
}

export async function getFile (req: Request, res: Response, next: NextFunction) {
    let options = {
        root: 'F:\\art\\pictures\\test\\', // TODO need to configure path
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }
    let fileName = req.params.name

    res.sendFile(fileName, options, function (err) {
        if (err) {
            next(err)
        } else {
            console.log('Sent:', fileName)
        }
    })
}

export async function addPicture (req: Request, res: Response, next: NextFunction) {
    let artistUserName = req.params.artistUserName;
    if(artistUserName == res.locals.user?.userName) {
        let picture : Picture = req.body as Picture;
        let missingFields;
        try {
            missingFields = checkFields(picture);
            if(missingFields != "") {
                throw new Error("Bad input, fields missing: " + missingFields);
            }
            picture.date = new Date();
            picture.userName = artistUserName;
        }
        catch (e) {
            console.error(e);
            res.status(400);
            return res.send("Bad input, fields missing: " + missingFields);
        }
        let response = await mongoDBClient.createResource("pictures", picture);
        if(response.acknowledged) {
            res.status(201);
        }
        else {
            res.status(409);
        }
        return res.send(response);
    }
    else {
        res.status(401);
        console.log("error: artistUserName " + artistUserName + " locals user name: " + res.locals.user?.username);
        return res.send();
    }
}

export async function getPictures (req: Request, res: Response, next: NextFunction) {
    let pictures = await getResources(req, res, next, setKeysForFilter, getPage);
    console.log("inside" + JSON.stringify(pictures));
    if(pictures) {
        return res.send(pictures);
    }
    else {
        res.status(404);
        return res.send();
    }
}

function setKeysForFilter(urlQuery : ParsedQs) : {[key: string]: any} {
    let date = urlQuery.date as string;
    let artist = urlQuery.artist as string;
    let userName = urlQuery.userName as string;
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
        return await mongoDBClient.getResourceByPage("pictures", pageIndex, pageSize, filterTerms, searchText, fields);
   // }
}
