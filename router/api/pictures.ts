import express, { Request, Response } from "express";
export const publicPicturesRouter = express.Router();
export const protectedPicturesRouter = express.Router();
const picturesController = require('../../controllers/pictures');

/*publicPicturesRouter.route('/')
    .get(picturesController.getPictures)
    .patch(picturesController.addReplyToPicture)*/

publicPicturesRouter.route('/artists/:pictureId')
    .get(picturesController.getPictureWithUserInfo);

//publicPicturesRouter.route('/').get(picturesController.filterPictures)
publicPicturesRouter.route('/').get(picturesController.getPictures);

/*picturesRouter.route('/')
    .post(authenticate);*/

protectedPicturesRouter.route('/')
    .post(picturesController.addPicture);

protectedPicturesRouter.route('/')
    .delete(picturesController.deletePicture);