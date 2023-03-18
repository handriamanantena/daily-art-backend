import express, { Request, Response } from "express";
export const publicPicturesRouter = express.Router();
export const protectedPicturesRouter = express.Router();
const picturesController = require('../../controllers/pictures');
const authenticate  = require("../../router/authenticate")

publicPicturesRouter.route('/')
    .get(picturesController.getPictures)
    .patch(picturesController.addReplyToPicture)

publicPicturesRouter.route('/:id')
    .get(picturesController.getPicture);

/*picturesRouter.route('/')
    .post(authenticate);*/

protectedPicturesRouter.route('/')
    .post(picturesController.addPicture);