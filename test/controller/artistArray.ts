import {ObjectId} from "../../adapters/database/MongoDB";

export let artistDB = [{
    "_id": new ObjectId("648c96804207c39d2060cfcb"),
    "email": "test2@email.com",
    "userName": "username2",
    "password": "$2a$10$en1617FdAsbjSUGakNBoYuMB48CTLABxknzxU7Qb9T5b0yecsHfwq",
    "streak": 1
},
    {
        "_id": new ObjectId("648c96804207c39d2060cfcc"),
        "email": "test3@email.com",
        "userName": "username3",
        "password": "$2a$10$en1617FdAsbjSUGakNBoYuMB48CTLABxknzxU7Qb9T5b0yecsHfwq",
    },
    {
        "email": "test4@email.com",
        "userName": "username4",
        "password": "$2a$10$en1617FdAsbjSUGakNBoYuMB48CTLABxknzxU7Qb9T5b0yecsHfwq",
        "streak": 2
    }
];