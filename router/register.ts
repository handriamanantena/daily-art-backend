import express, {Router} from "express";
export const registerRouter : Router = express.Router();
const controller = require('../controllers/artist');

registerRouter.route('/')
    .post(controller.registerArtist);
