import express from "express";
export const publicArtistRouter = express.Router();
export const protectedArtistRouter = express.Router();
const artistController = require('../../controllers/artist');

publicArtistRouter.route('/')
    .post(artistController.getArtist); //TODO move to login

publicArtistRouter.route('/username').get(artistController.getArtistUserNames);

protectedArtistRouter.route('/').put(artistController.updateArtist);

