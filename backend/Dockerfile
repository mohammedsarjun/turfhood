FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json

RUN npm ci

COPY backend ./backend
COPY shared ./shared

WORKDIR /app/backend

RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]