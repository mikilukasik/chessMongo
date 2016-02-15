#!/bin/bash  
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000

cd chessMongo




mongod --port 17890 --fork --syslog --smallfiles --dbpath data

nohup nodemon server.js </dev/null