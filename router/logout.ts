import express, {Router} from "express";
export const logoutRouter : Router = express.Router();
const controller = require('../controllers/authController');

logoutRouter.route('/')
    .get(controller.logout);

module.exports = logoutRouter;