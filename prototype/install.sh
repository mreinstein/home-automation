#!/usr/bin/env node

sudo apt-get update

sudo apt-get upgrade

sudo apt-get install python-pyaudio python3-pyaudio sox portaudio libatlas-base-dev libmagic-dev

wget https://bootstrap.pypa.io/get-pip.py

python get-pip.py

pip install pyaudio
