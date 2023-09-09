import {ObjectId} from "mongodb";


export class Utility {

    fromStringToMongoId(id: string): ObjectId | undefined {
        try {
            let objectId = new ObjectId(id);
            return objectId;
        }
        catch (e) {
            console.error("id has incorrect format");
            return undefined;
        }
    }
}