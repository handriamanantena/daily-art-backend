import express, {Router} from "express";
export const authentication : Router = express.Router();
const controller = require('../controllers/authController');

authentication.route('/')
    .post(controller.refresh)

module.exports = authentication;