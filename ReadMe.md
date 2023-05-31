##Getting Started

###Get mongodb

You can download mongodb. Optionally, you can run the docker image from the docker-compose file located at root. 

###Start mongodb server after download

example: ```mongod --dbpath /f/art/data/db```

```mongod --dbpath {path to store data}```

###Start mongodb server from docker
```docker-compose up -d```
Currently there is no mock data. I still need to configure mongo-init.js


###Configure config.ts
Before you start the back end server you will need to configure configTemplate.ts.

Step 1.
Rename configTemplate.ts to config.ts

Step 2.
You will need to add a secret for the jwt tokens. Each section marked with secret will need to be filled with a jwt secret. Make sure its 55 characters

Step 3.
To enable google login you will need to configure the below variable. You will need a google client_id, which must be configured from google cloud platform. 
https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid

```
google: {
    client_id: 'TODO'
}
```

###Start express server fast reload (es6/typscript)
```
npm install
npm start
```

###Mock data
TODO need to dockerize mock data


## Run tests
```npm test``` Will run jest test
