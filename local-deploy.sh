docker-compose build
docker-compose push

botName=${PWD##*/}

ssh oravm "
mkdir ~/discordBots/$botName
mkdir ~/discordBots/$botName/config
"

scp docker-compose.deploy.yml oravm:discordBots/$botName
scp docker-compose.yml oravm:discordBots/$botName
scp -r config/env oravm:discordBots/$botName/config/


ssh oravm "
mkdir ~/discordBots/$botName
cd ~/discordBots/$botName
/home/pi/.local/bin/docker-compose -f docker-compose.deploy.yml pull
/home/pi/.local/bin/docker-compose -f docker-compose.deploy.yml up -d
"
