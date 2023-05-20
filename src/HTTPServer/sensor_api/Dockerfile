FROM fedora:latest

# 建立工作目錄
WORKDIR /usr/src/app

# 安裝&更新所需的套件
RUN dnf update -y
RUN dnf install nodejs npm -y 

# Install app dependencies
# 把目錄下的程式碼直接復制到容器中
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install 
COPY . .

# 指定使用的端口
EXPOSE 3095
EXPOSE 3094 

# 容器啟動時
CMD [ "npm", "start" ]