FROM node:14 As development

WORKDIR /TuanAnh/src/app

COPY package*.json ./

RUN yarn --only=development

COPY . .

RUN yarn build

FROM node:14 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /TuanAnh/src/app

COPY package*.json ./

RUN yarn --only=production

COPY . .

COPY --from=development /TuanAnh/src/app/dist ./dist

CMD ["node", "dist/main"]