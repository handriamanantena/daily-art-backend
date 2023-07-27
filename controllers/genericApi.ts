import {NextFunction, Request, Response} from "express";
import {ParsedQs} from "qs";
import {Picture} from "../model/picture";

const ignoredSearchKeys = ["pageIndex", "pageSize", "date"];

export const getResources = async <T>(req : Request, res : Response, next: NextFunction,
                                      setKeysForFilter : (queryParameters : ParsedQs) => {[key: string]: any},
                                      getResourceByPage: (pageIndex: string, pageSize: number, filterTerms : {[key: string]: any}, searchText: string, fields: {[key: string]: 1|0}) => Promise<T[]>) => {
    let urlQuery = req.query;
    let pageIndex = urlQuery.pageIndex as string;
    let pageSize = +(urlQuery.pageSize as string);
    let filterTerms = setKeysForFilter(urlQuery);
    let search = urlQuery.search as string;
    if (search == undefined) {
        search = "";
    }
    console.log("filterTerms " + JSON.stringify(filterTerms));
    console.log("searchText " + JSON.stringify(search));
    console.log("pageSize " + JSON.stringify(pageSize));
    console.log("pageIndex " + JSON.stringify(pageIndex));
    let fields = splitFields(urlQuery);
    console.log("fields " + JSON.stringify(fields));
    let resources = await getResourceByPage(pageIndex, pageSize, filterTerms, search, fields);
    console.log("generic " + JSON.stringify(resources));
    return resources;

}

const convertQueryToMap = (query: ParsedQs) : any[] => {
    let querySearchTerms = [];
    for (let propName in query) {
        if (query.hasOwnProperty(propName)) {
            querySearchTerms.push({[propName] : query[propName] as string});
        }
    }
    return querySearchTerms;
}

const splitFields = (query : ParsedQs) : { [key: string]: 1|0 } => {
    let mongoDBProjection : {[key: string]: 1|0 } = {};
    let containsId = false;
    if(query.fields != undefined) {
        let fields = decodeURI(query.fields as string).split(",");
        for(let field of fields) {
            if(field == "_id") {
                containsId = true;
            }
            mongoDBProjection[field] = 1;
        }
    }
    /*if(!containsId) {
        mongoDBProjection._id = 0;
    }*/
    return mongoDBProjection
}

const getResourcePaginationByIndex = async (req : Request, res : Response, next: NextFunction) =>{

}

const getResourcePaginationByDate = async (req : Request, res : Response, next: NextFunction) =>{


}