import {Picture, PictureDB} from "./model/picture";
import { Picturesmongodb } from "./picturesmongodb";
const pictureMongodb = new Picturesmongodb();
import express, {NextFunction} from 'express';
import type { ErrorRequestHandler } from "express";
import { HttpError, Http404Error } from "./error/HttpErrors"
import cors from 'cors';

const app = express()
const port = 3001
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/file/:name', function (req, res, next) {
    let options = {
        root: 'F:\\art\\pictures\\test\\',
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
})

app.get('/pictures/:id', function (req, res, next) {
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
        /*next(new HttpError({
            error: {
                message: e.message,
                innerError: e.stack
            }
        }))*/
        next(e)
    })
})


app.get('/pictures', function (req, res, next) {
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
})

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if(err instanceof Http404Error) {
        res.status(404)
        res.send(err.error)
    }
    else if(err instanceof HttpError){
        res.status(500)
        res.send(err.error)
    }
    else {
        res.status(500)
        res.send(err.message)
        console.error(err)
    }
};

app.use(errorHandler)

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})