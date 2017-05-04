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


# set up the correct timezone
sudo dpkg-reconfigure tzdata

# set up unattended-upgrades
sudo apt-get install unattended-upgrades apt-listchanges bsd-mailx -y

sudo sed -i 's/^\/\/      "o=Raspbian,n=jessie"/      "o=Raspbian,n=jessie"/g' /etc/apt/apt.conf.d/50unattended-upgrades

# allow automatic reboots as required
sudo sed -i 's/^\/\/Unattended-Upgrade::Automatic-Reboot "false";/Unattended-Upgrade::Automatic-Reboot "true";/g' /etc/apt/apt.conf.d/50unattended-upgrades
sudo sed -i 's/^\/\/Unattended-Upgrade::Automatic-Reboot-Time "02:00";/Unattended-Upgrade::Automatic-Reboot-Time "02:00";/g' /etc/apt/apt.conf.d/50unattended-upgrades

# allow removing unused packages
sudo sed -i 's/^\/\/Unattended-Upgrade::Remove-Unused-Dependencies "false";/Unattended-Upgrade::Remove-Unused-Dependencies "true";/g' /etc/apt/apt.conf.d/50unattended-upgrades

# You could also create this file by running "dpkg-reconfigure -plow unattended-upgrades"
sudo tee /etc/apt/apt.conf.d/20auto-upgrades > /dev/null <<EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
