FROM node:8.15

RUN mkdir /workspace
WORKDIR /workspace

# copy source codes to workspace dir
COPY ./ /workspace

# remove unless source files
RUN rm -rf test .gitignore Dockerfile Jenkinsfile .git node_modules docs
RUN npm i

EXPOSE 3000

CMD ["npm", "start"]