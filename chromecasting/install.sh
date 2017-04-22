#!/bin/bash

# install node/npm
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -

sudo apt-get install -y nodejs build-essential

sudo apt-get update

sudo apt-get upgrade


npm install

mkdir ~/media

# configure the voice interaction agent to run automatically at boot, restart on failure
sudo cp home-video.service /lib/systemd/system/

sudo systemctl daemon-reload

sudo systemctl enable home-video.service

sudo systemctl start home-video.service
