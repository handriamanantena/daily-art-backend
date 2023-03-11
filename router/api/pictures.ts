import express, { Request, Response } from "express";
const picturesRouter = express.Router();
const picturesController = require('../../controllers/pictures');
const authenticate  = require("../../router/authenticate")

picturesRouter.route('/')
    .get(picturesController.getPictures)
    .patch(picturesController.addReplyToPicture)

picturesRouter.route('/:id')
    .get(picturesController.getPicture);

/*picturesRouter.route('/')
    .post(authenticate);*/

picturesRouter.route('/')
    .post(picturesController.addPicture);

module.exports = picturesRouter;
