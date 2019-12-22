FROM node:10.13.0

#Download and Compile Python
RUN apt-get install build-essential checkinstall && \
    apt-get install libreadline-gplv2-dev libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev && \
    cd /usr/src && \
    wget https://www.python.org/ftp/python/2.7.16/Python-2.7.16.tgz && \
    tar xzf Python-2.7.16.tgz && \
    cd Python-2.7.16 &&\
    ./configure --enable-optimizations && \
    make altinstall

#Install Pip
Run apt update && apt install python3-pip

Add . /app

WORKDIR /app

# Install Requirements
RUN pip install -r requirements.txt
RUN npm install -f

# Create empty .env file
RUN touch .env && \
    yarn install
RUN npm install -g nodemon

#CMD [ "npm", "start" ]
#CMD pm2-runtime start ecosystem.config.js
CMD npm start