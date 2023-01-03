import express, {Router} from "express";
export const authentication : Router = express.Router();
const controller = require('../controllers/authController');

authentication.route('/logout')
    .get(controller.logout)

authentication.route('/login')
    .post(controller.login)

authentication.route('/refresh')
    .post(controller.refresh)

module.exports = authentication;