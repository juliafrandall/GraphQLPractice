FROM ubuntu:14.04

MAINTAINER Owen Diehl odiehl@nutritionix.com

RUN apt-get install -y curl && curl -sL https://deb.nodesource.com/setup_5.x | bash -
RUN apt-get update && apt-get install -y \
curl \
build-essential \
software-properties-common \
git \
nodejs

RUN apt-add-repository ppa:ansible/ansible && apt-get update
RUN apt-get install -y ansible

RUN npm install -g n && n 0.12.7
RUN npm install -g npm

COPY ./.npmrc /root/.npmrc
COPY ./.bowerrc /root/.bowerrc
