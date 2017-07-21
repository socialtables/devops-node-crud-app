FROM node:boron

ADD . /code

WORKDIR /code

RUN npm install

ENTRYPOINT ["npm"]
CMD ["start"]