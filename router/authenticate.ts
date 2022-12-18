import express from "express";
import authController from "../controllers/authController"



const authenticate = express.Router()

authenticate.use("/", async (req, res, next) => {
    await authController.handleAuth(req, res, next);
});


module.exports = authenticate
