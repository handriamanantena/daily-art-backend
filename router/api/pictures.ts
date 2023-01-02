import express, { Request, Response } from "express";
export const picturesRouter = express.Router();
const picturesController = require('../../controllers/pictures');

picturesRouter.route('/')
    .get(picturesController.getPictures)
    //.patch(picturesController.updatePicture)

/*picturesRouter.route('/:id')
    .get(picturesController.getPicture);*/

module.exports = picturesRouter;
