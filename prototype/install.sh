#!/bin/bash

# install node/npm
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -

sudo apt-get install -y nodejs build-essential

sudo apt-get update

sudo apt-get upgrade


# install and configure dependencies required by snowboy
sudo apt-get install python-pyaudio python3-pyaudio sox libatlas-base-dev libmagic-dev libasound2-dev
#wget https://bootstrap.pypa.io/get-pip.py
#python get-pip.py
#pip install pyaudio


npm install


# configure the voice interaction agent to run automatically at boot, restart on failure
sudo cp home-automation.service /lib/systemd/system/

sudo systemctl daemon-reload

sudo systemctl enable home-automation.service

sudo systemctl start home-automation.service
