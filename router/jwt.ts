import express, {Router} from "express";
export const jwtRouter : Router = express.Router();
const controller = require('../controllers/authController');

jwtRouter.route('/')
    .post(controller.verifyJwt);

module.exports = jwtRouter;