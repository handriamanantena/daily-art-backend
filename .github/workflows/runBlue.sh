#!/bin/bash

# determine file and port
CURRENT_PORT=$(grep -oP 'proxy_pass http://localhost:\K\d+' /etc/nginx/conf.d/dailyirasuto.com.conf
)
if [ "$CURRENT_PORT" == 3001 ]; then
    BLUE_PORT="3000"
else
    BLUE_PORT="3001"
fi
docker stop dailyart-container-blue || true; docker rm dailyart-container-blue || true; docker run --name dailyart-container-blue -d -p $BLUE_PORT:3000 registry.digitalocean.com/dailyirasuto-backend-images/dailyart:production-update