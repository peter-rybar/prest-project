# docker build -t prest-project .
# docker images
# docker ps
# docker run -it --rm -p 3000:3000 prest-project
# docker system prune -a


# latest LTS (long term support) version carbon of node available from the Docker Hub
FROM node

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
#ADD package*.json /app

#RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
ADD . /app

#RUN npm run dist

# app binds to port 3000 so use the EXPOSE
EXPOSE 3000

# Define environment variable
# ENV NODE_ENV production

WORKDIR /app/server

# CMD [ "npm", "run", "server:cluster" ]
CMD npm run server:cluster
