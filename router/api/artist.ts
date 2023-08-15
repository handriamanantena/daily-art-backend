import express from "express";
export const publicArtistRouter = express.Router();
export const protectedArtistRouter = express.Router();
const artistController = require('../../controllers/artist');

publicArtistRouter.route('/login')
    .post(artistController.login); //TODO move to login

publicArtistRouter.route('/').get(artistController.getArtists);

protectedArtistRouter.route('/').put(artistController.updateArtist);

