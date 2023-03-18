import express from "express";
export const jwtRouter = express.Router();
const controller = require('../controllers/authController');

jwtRouter.use('/', controller.verifyJwt);