import express from "express";
const artistRouter = express.Router();
const artistController = require('../../controllers/artist');

artistRouter.route('/')
    .post(artistController.getArtist);

module.exports = artistRouter;