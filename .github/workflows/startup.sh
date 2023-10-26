#!/bin/bash
docker stop dailyart-container-blue; docker rm dailyart-container-blue; docker run --name dailyart-container-blue -d -p 3000:3000 registry.digitalocean.com/dailyirasuto-backend-images/dailyart:staging
docker stop dailyart-container-green; docker rm dailyart-container-green; docker run --name dailyart-container-green -d -p 3001:3000 registry.digitalocean.com/dailyirasuto-backend-images/dailyart:production
