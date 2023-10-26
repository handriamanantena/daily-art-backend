FROM node:18-alpine

RUN mkdir -p /build

COPY package*.json ./
RUN npm ci --omit=dev

COPY /build /build
COPY .env .env
COPY /drawingOftheDay/csv/words.csv /drawingOftheDay/csv/words.csv
EXPOSE 3000
CMD ["node", "build/index.js"]