# react-with-actions

![Continuous  Integration & Continuous Deployment](https://github.com/kenessajr/react-with-actions/workflows/CI%20&%20CD/badge.svg)
![Twitter Follow](https://img.shields.io/twitter/follow/kenessajr?label=kenessajr&style=social)

## Introduction

Recently we've been automating all our deployment processes at [Pindo](https://www.pindo.io/) by setting up a continuous development pipeline for our repositories. This helped us in reducing the number of errors that could have been taking place in the many repetitive steps of CI and CD.

In this tutorial, you will learn how to set up continuous integration and continuous deployment of a react app using tools like [Docker](https://www.docker.com/) and [Github Actions](https://github.com/features/actions). We will be using an Ubuntu 18.04 LTS droplet on [DigitalOcean](https://www.digitalocean.com/) to host our app.


## Prerequisites

Here are the prerequisites required for this tutorial. 
- A Github account [Github](https://github.com/)
- A [Docker Droplet](https://marketplace.digitalocean.com/apps/docker) (Ubuntu 18.04 LTS) on DigitalOcean. Sign up with my [Referral Link](https://m.do.co/c/3823fc9590b7) and get $100 in credit for over 60 days.

## Create your app.

[create-react-app.dev](https://create-react-app.dev/docs/getting-started/) is an officially supported way to create a single-page React application. It offers a modern build setup with no configuration.
- Install create-react-app
```bash
npm install -g create-react-app
```
- Quick Start
```bash
npx create-react-app my-app && cd my-app
npm start
```

## Dockerize your app.
Add a Dockerfile to the project root:
```docker
FROM node:13.1-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn cache clean && yarn --update-checksums
COPY . ./
EXPOSE 3000
CMD ["yarn", "start"]

```
> `yarn cache clean` running this command will clear the global cache.
> `yarn --update-checksums` lock lockfile if there's a mismatch between them and their package's checksum.

Let build and tag our docker image
```bash
docker build -t my-app:dev .
```
Run the container once the build is done
```bash
docker run -it -p 3000:3000 my-app:dev 
```

Boom 💥, our app is running on [http://localhost:3001](http://localhost:3000/)
!['app-image'](https://pindo.ams3.digitaloceanspaces.com/Screen%20Shot%202020-03-02%20at%2021.45.05.png)

Let's create another Dockerfile to the project root: for use in production called *Dockerfile-prod:*

```docker
FROM node:13.1-alpine as build

WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn cache clean && yarn --update-checksums
COPY . ./
RUN yarn && yarn build

# Stage - Production
FROM nginx:1.17-alpine
COPY --from=build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
> In this *Dockerfile-prod* we're creating a production build for our app.
> We're also copying the build file to nginx html directory.

Let's build and run our production image.
```bash
docker build -f Dockerfile-prod -t my-app:prod .
```
```bash
docker run -itd -p 80:80 --rm my-app:prod
```
> Our app is running on port 80. Let's get to our third step.


## Publish Your Image to Github Packages.

[Github Packages](https://github.com/features/packages) allows you to safely publish and consume packages within your organization or with the entire world.
To archive this we're going to create a Github Action which will be responsible for publishing our package to the Github Packages Registry.
Before we deploy our production image to the registry we need to make sure that our code our production-ready. 

### deploy.yml

Let's create our first Continuous Integration (CI) action in our project.
```bash
mkdir .github && cd .github && mkdir workflows && cd workflows && touch deploy.yml
``` 
> This command first creates a workflow folder and change the directory to the folder then create a `deploy.yml` file. You can replace `yarn` with `npm` in the code below.

```yaml
name: CI & CD

on:
push:
branches: 
- master

jobs:
build:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v1
- name: Use Node.js 12.10
uses: actions/setup-node@v1
with:
node-version: '12.10'
- name: Install yarn and run unittest
run: |
yarn
yarn test
env:
CI: true
- name: Publish to Github Packages Registry
uses: elgohr/Publish-Docker-Github-Action@master
with:
name: my_github_username/my_repository_name/my_image_name
registry: docker.pkg.github.com
username: ${{ secrets.GITHUB_USERNAME }}
password: ${{ secrets.GITHUB_TOKEN }}
dockerfile: Dockerfile-prod
tags: latest
```
> Note that Github Actions automatically provide your GITHUB_TOKEN secrets. 

### Github Repository and Remote Origins

![Alt. repo](https://dev-to-uploads.s3.amazonaws.com/i/7cy6xeat508b5e7nhct3.png)

**Add Remote origins to our repository**
![Alt remote-origin](https://dev-to-uploads.s3.amazonaws.com/i/qjj2wi2ogk2jfzihu58i.png)

**Add repository secrets**
[Secrets](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) are encrypted environment variables that you create in a repository for use with GitHub Actions.
Let's add our `GITHUB_USERNAME` to the secrets not that the `GITHUB_TOKEN` is provided by default by GITHUB.

![Alt Secrets](https://dev-to-uploads.s3.amazonaws.com/i/v02d6fbuhavi6ilyfjv8.jpeg)

**Push to master**
We're now done setting up our secrets, we have also created our remote repository and set remote origins to our local repository. Let's then go ahead and push our changes to our remote repo. 

```bash
git add -A
git commit -m "Initial commit"
git push origin master
```

Click on actions a deployment workflow will start. Wait and see your image being publish in your Github Packages Registry.

![Alt actions](https://dev-to-uploads.s3.amazonaws.com/i/u44quiqpbfzd3btnvj5s.jpeg)

Let's look at our package now.

![Alt profile-package](https://dev-to-uploads.s3.amazonaws.com/i/witdemf8bx6y1hdalijb.jpeg)

You can also find your docker image package in your repository.

![Alt repo-pack](https://dev-to-uploads.s3.amazonaws.com/i/zqyl0eyvhyqzdvfvy81q.jpeg)

![Alt pack-det](https://dev-to-uploads.s3.amazonaws.com/i/g9ij5p8jnbv1yr4uu46l.png)

We've successfully managed to publish our docker app image on the Github Package Registry. Next, we're going to order a Docker Droplet on DigitalOcean and set up a flow in order to deploy and our app image on DigitalOcean.

## Deploy.

Let's first order for a [Docker Droplet](https://marketplace.digitalocean.com/apps/docker) on DigitalOcean don't forget to sign up with my [Referral Link](https://m.do.co/c/3823fc9590b7) and get $100 in credit for over 60 days.

![Alt docker-droplet](https://dev-to-uploads.s3.amazonaws.com/i/s3ksr4go646y3e4389v3.png)

For this example, we will be accessing our droplet with a username and a password, please choose a one-time password over an SSH key.

![Alt one-t-p](https://dev-to-uploads.s3.amazonaws.com/i/95ph8r6gu9zv6kc8m27l.png)

After configuring and resetting your droplet password let's now add your droplet secrets to your repository.
- HOST: Droplet IP_ADDRESS
- PASSWORD: Droplet PASSWORD
- PORT: Droplet SSH port (22)
- USERNAME: Droplet USERNAME

![Alt secrets-do](https://dev-to-uploads.s3.amazonaws.com/i/cerjcwho6vf2wp45bfsi.png)


### Update deploy.yml file. 

We're done setting up our droplet secrets to our repository. We will add another code block to deploy our package and run it in our droplet using [ssh-action](https://github.com/appleboy/ssh-action). It's GitHub Actions for executing remote ssh commands.

```yaml
name: CI & CD

on:
push:
branches: 
- master

jobs:
build:
runs-on: ubuntu-latest
steps:
- uses: actions/checkout@v1
- name: Use Node.js 13.10
uses: actions/setup-node@v1
with:
node-version: '13.10'
- name: Install yarn and run unittest
run: |
yarn
yarn test
env:
CI: true
- name: Publish to Github Packages Registry
uses: elgohr/Publish-Docker-Github-Action@master
with:
name: my_github_username/my_repository_name/my_image_name
registry: docker.pkg.github.com
username: ${{ secrets.GITHUB_USERNAME }}
password: ${{ secrets.GITHUB_TOKEN }}
dockerfile: Dockerfile-prod
tags: latest
- name: Deploy package to digitalocean
uses: appleboy/ssh-action@master
env:
GITHUB_USERNAME: ${{ secrets.GITHUB_USERNAME }}
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
with:
host: ${{ secrets.HOST }}
username: ${{ secrets.USERNAME }}
password: ${{ secrets.PASSWORD }}
port: ${{ secrets.PORT }}
envs: GITHUB_USERNAME, GITHUB_TOKEN
script: |
docker stop $(docker ps -a -q)
docker login docker.pkg.github.com -u $GITHUB_USERNAME -p $GITHUB_TOKEN
docker run -dit -p 80:80 docker.pkg.github.com/my_github_username/my_repository_name/my_image_name:latest
```
> We previously published the app image to the Github Package Registry by signing in with the Github Credentials (GITHUB_USERNAME and GITHUB_TOKEN ). To pull the image from the registry we must also log in to archive so.  

Let's commit and push our changes to master.

```bash
git add -A
git commit -m "deploy to digitalocean"
git push origin master
```

We're using the ssh-action to remotely access our droplet from our repository.
- `docker stop $(docker ps -a -q)` stops all the previous running containers.
- `docker run -dit -p 80:80 my_github_username/my_repository_name/my_image_name:tag` pull the lastest image and run it on port 80. 

As you can bellow the workflow is passing. 

![Alt workflow](https://dev-to-uploads.s3.amazonaws.com/i/52ufx0strbdadpmt067z.png)

You can now access your react-app on your droplet IP_ADDRESS or DOMAIN_NAME.

Mine is running on [http://167.172.51.225/](http://167.172.51.225/)

![Alt web-app](https://dev-to-uploads.s3.amazonaws.com/i/t94gonkmu223ol8gufid.png)



> All the codes can be found here [https://github.com/kenessajr/react-with-actions](https://github.com/kenessajr/react-with-actions)

## Contributions
Pull requests are welcome! I'am happy to review and accept pull requests for the following:
- README.md Improvement
- Github Actions workflow Improvement

Ping [@kenessajr](https://twitter.com/kenessajr) on Twitter if you have any questions about how to contribute --I'm happy to help.


## License
[MIT](https://choosealicense.com/licenses/mit/)
