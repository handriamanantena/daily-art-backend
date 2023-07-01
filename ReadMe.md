##Getting Started

###Get mongodb

You can download mongodb. Optionally, you can run the docker image from the docker-compose file located at root. 

###Start mongodb server after download

example: ```mongod --dbpath /f/art/data/db```

```mongod --dbpath {path to store data}```

###Start mongodb server from docker
```docker-compose up -d```
Currently there is no mock data. I still need to configure mongo-init.js

###Connect to local databse
```
mongodb://127.0.0.1:27017/?readPreference=primary&serverSelectionTimeoutMS=2000&appname=MongoDB%20Compass&directConnection=true&ssl=false
```

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

## Run in production
Create build
```
npm run build
```
Run forever

In the linux machine you will need to run 
```
sudo npm install pm2@latest -g
```
Then run 
```
pm2 start build/index.js
```

```index.js``` is located where you specified the build in ```tsconfig.json``` under the ```outDir``` setting.

##PM2

####To start
```pm2 start hello.js```

####To stop
```pm2 stop app_name_or_id```

####To restart
```pm2 restart app_name_or_id```

####PM2 to list
```pm2 list```

####PM2 for logs
```tail -f ~/.pm2/logs/index-out.log```


