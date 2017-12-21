FROM ubuntu:14.04


# -------
# Update
# -------
RUN apt-get update -y

# Install Essential Tools
RUN apt-get install -y curl wget git unzip screen

# Install and Update to the latest system software
RUN apt-get install -y build-essential chrpath libssl-dev libxft-dev libffi-dev libmagic-dev
# End


# ---------------
# Install NodeJS
# ---------------
RUN sudo apt-get purge nodejs npm
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN sudo apt-get install -y nodejs
RUN npm install -g nodemon
# End

RUN apt-get install -y build-essential python2.7-dev python-dev fontconfig
RUN wget -O get-pip.py https://bootstrap.pypa.io/get-pip.py && python get-pip.py && rm get-pip.py
