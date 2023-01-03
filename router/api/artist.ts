import express from "express";
import {authentication} from "../authentication";
const artistRouter = express.Router();
const artistController = require('../../controllers/artist');

artistRouter.route('/')
    .post(artistController.addArtist);

module.exports = artistRouter;