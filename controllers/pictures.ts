import express, {NextFunction, Request, Response} from "express";
import {Picture, PictureDB} from "../model/picture";
import {Http404Error} from "../error/HttpErrors";
import {collections} from "../dbConnection/dbConn";
import {Picturesmongodb} from "../picturesmongodb";
import {MongoDBClient} from "../dbConnection/MongoDBClient";
import * as mongoDB from "mongodb";
import {ObjectId} from "mongodb";
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
        else if(search && pageSize){
            let pictures: Picture[];

            if(pageIndex) {
                pictures = await mongoDBClient.getResourcePage<Picture>("pictures",
                    {$and: [{_id: {$gt: new ObjectId(pageIndex)}},  { $text: { $search: search }}]}, pageSize);
            }
            else {
                pictures = await mongoDBClient.getResourcePage<Picture>("pictures",
                    {$text: { $search: search }}, pageSize);
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
            let pictures: Picture[] = await mongoDBClient.getResources<Picture>("pictures", query);
            if(pictures) {
                return res.send(pictures);
            }
            else {
                res.status(404);
                return res.send();
            }
        }
        else {
            res.status(500);
            return res.send();
        }
    }
    /*const query1 = {$and: [ { startMonth: { $lte:new Date(date)} }, { endMonth: {$gte : new Date(date)} }]};

    let pictures = await mongoDBClient.getResources("pictures", query);
    console.log(pictures);
    res.send();*/
}

export async function getPictures (req: Request, res: Response, next: NextFunction) {
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
            console.log(e)
            res.send(e)
        })
    }
}

export async function getPicture (req: Request, res: Response, next: NextFunction) {
    let pictureId = req.params.id
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
    pictureMongodb.addPicture(req.body).then(value => {
        res.send(value)
    }).catch(e => {
        console.log(e)
        next(e)
    })
}

