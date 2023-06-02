import {Picture} from "../../model/picture";


export function checkFields(picture : Picture) {
    let missingFields = "";
    if(picture.pictureName == undefined || picture.pictureName == "") {
        missingFields+="pictureName ";
    }
    return missingFields;
}