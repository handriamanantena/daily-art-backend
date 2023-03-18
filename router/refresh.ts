import express, {Router} from "express";
export const refresh : Router = express.Router();
const controller = require('../controllers/authController');

refresh.route('/')
    .post(controller.refresh)

module.exports = refresh;