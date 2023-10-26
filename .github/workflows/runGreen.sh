#!/bin/bash

# determine file and port
CURRENT_PORT=$(grep -oP 'proxy_pass http://localhost:\K\d+' /etc/nginx/conf.d/dev-api.dailyirasuto.com.conf)
if [ "$CURRENT_PORT" == 3001 ]; then
    GREEN_PORT="3000"
    BLUE_PORT="3001"
else
    GREEN_PORT="3001"
    BLUE_PORT="3000"
fi

docker tag registry.digitalocean.com/dailyirasuto-backend-images/dailyart:production registry.digitalocean.com/dailyirasuto-backend-images/dailyart:staging || true;
docker stop dailyart-container-blue || true; docker rm dailyart-container-blue || true; docker run --name dailyart-container-blue -d -p $CURRENT_PORT:3000 registry.digitalocean.com/dailyirasuto-backend-images/dailyart:production
docker rename dailyart-container-green dailyart-container-changing || true;
docker rename dailyart-container-blue dailyart-container-green || true;
docker rename dailyart-container-changing dailyart-container-blue || true;
sed -i "s/proxy_pass http:\/\/localhost:[0-9]*;/proxy_pass http:\/\/localhost:$GREEN_PORT;/" /etc/nginx/conf.d/dev-api.dailyirasuto.com.conf
sudo systemctl reload nginx