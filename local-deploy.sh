docker-compose build
docker-compose push

botName=${PWD##*/}

ssh discordpi "
mkdir ~/discordBots/$botName
mkdir ~/discordBots/$botName/config
"

scp docker-compose.deploy.yml discordpi:discordBots/$botName
scp docker-compose.yml discordpi:discordBots/$botName
scp -r config/env discordpi:discordBots/$botName/config/


ssh discordpi "
mkdir ~/discordBots/$botName
cd ~/discordBots/$botName
/home/pi/.local/bin/docker-compose -f docker-compose.deploy.yml pull
/home/pi/.local/bin/docker-compose -f docker-compose.deploy.yml up -d
"
