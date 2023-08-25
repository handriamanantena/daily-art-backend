import {Picture} from "../../model/picture";


export function checkFields(picture : Picture) {
    let missingFields = "";
    if((picture.pictureName == undefined || picture.pictureName == "") && (picture.dailyChallenge == undefined || picture.dailyChallenge == "")) {
        missingFields+="pictureName,dailyChallenge";
    }
    return missingFields;
}