import express from "express"
export const publicWordsRouter =  express.Router();
const wordsController = require('../../controllers/words');

publicWordsRouter.route("/date/:date").get(wordsController.getWordByDate);
publicWordsRouter.route("/date").get(wordsController.getWordByDate);
