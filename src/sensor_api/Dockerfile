FROM fedora:latest

# 建立工作目錄
WORKDIR /usr/src/app

# 安裝&更新所需的套件
RUN dnf update -y
RUN dnf install nodejs npm -y 

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install 

# Bundle app source
COPY . .

EXPOSE 3095
CMD [ "npm", "start" ]