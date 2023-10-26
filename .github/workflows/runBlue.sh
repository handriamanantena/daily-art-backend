#!/bin/bash

# determine file and port
CURRENT_PORT=$(grep -oP 'proxy_pass http://localhost:\K\d+' /etc/nginx/conf.d/dev-api.dailyirasuto.com.conf)
if [ "$CURRENT_PORT" == 3001 ]; then
    GREEN_PORT="3001"
    BLUE_PORT="3000"
else
    GREEN_PORT="3000"
    BLUE_PORT="3001"
fi
docker stop dailyart-container-blue; docker rm dailyart-container-blue; docker run --name dailyart-container-blue -d -p $BLUE_PORT:3000 registry.digitalocean.com/dailyirasuto-backend-images/dailyart:staging