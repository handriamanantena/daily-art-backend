import express, { Request, Response } from "express";
import {filterPictures, getPictures} from "../../controllers/pictures";
export const publicPicturesRouter = express.Router();
export const protectedPicturesRouter = express.Router();
const picturesController = require('../../controllers/pictures');
const authenticate  = require("../../router/authenticate")

/*publicPicturesRouter.route('/')
    .get(picturesController.getPictures)
    .patch(picturesController.addReplyToPicture)*/

publicPicturesRouter.route('/:id')
    .get(picturesController.getPicture);

//publicPicturesRouter.route('/').get(picturesController.filterPictures)
publicPicturesRouter.route('/').get(picturesController.getPictures)

/*picturesRouter.route('/')
    .post(authenticate);*/

protectedPicturesRouter.route('/:userName')
    .post(picturesController.addPicture);

protectedPicturesRouter.route('/:userName')
    .post(picturesController.deletePicture);