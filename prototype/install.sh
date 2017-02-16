#!/bin/bash

curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -

sudo apt-get install -y nodejs build-essential

sudo apt-get update

sudo apt-get upgrade

sudo apt-get install python-pyaudio python3-pyaudio sox libatlas-base-dev libmagic-dev libasound2-dev

#wget https://bootstrap.pypa.io/get-pip.py
#python get-pip.py
#pip install pyaudio

npm install
