import express from "express";
const fileRouter = express.Router();
const pictureController = require('../../controllers/pictures');

fileRouter.route('/:name')
    .get(pictureController.getFile);

module.exports = fileRouter;