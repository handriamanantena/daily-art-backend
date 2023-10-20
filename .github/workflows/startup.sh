#!/bin/bash
cd ..
cd ..
pm2 stop dailyart-1
pm2 stop dailyart-2
pm2 start pm2Instance1.config.js
pm2 start pm2Instance.2config.js
export BLUE=3000
export GREEN=3001