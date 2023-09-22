import express from "express"
export const publicChallengesRouter =  express.Router();
const challengesController = require('../../controllers/challenges');

publicChallengesRouter.route("/date/:date").get(challengesController.getChallengeByDate);
publicChallengesRouter.route("/date").get(challengesController.getChallengeByDate);
publicChallengesRouter.route("/").get(challengesController.getWordsPage);
