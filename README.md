
This is likely not useful to anyone. Documenting how to set up my home automation systems. For now just a link dump.

```
|- 3461.*
|- asound.conf
|- speech-rec.sh
`- wpa_supplicant.conf
```

* 3461.* sphinx dictionary and language models
* asound.confg  my `/etc/asound.conf` file, configured to use MXL AC404 microphone
* speech-rec.sh my ultra-ghetto speech rec/light control script
* wpa_supplicant.conf my `/etc/wpa_supplicant/wpa_supplicant.conf` file, with ap and passphrase removed

## miscellaneous
[running nodejs process as systemd service](https://thomashunter.name/blog/running-a-node-js-process-on-debian-as-a-systemd-service/?utm_source=nodeweekly&utm_medium=email)

[using screen to keep things running](https://lhcb.github.io/analysis-essentials/shell/screen.html)

[using rsync to backup to an external drive](http://serverfault.com/questions/25329/using-rsync-to-backup-to-an-external-drive)

[btsync, the bittorrent client I'm using](https://itunes.apple.com/us/app/bittorrent-sync-file-transfer/id665156116)

## bittorrent sync (resilio) setup

https://melgrubb.com/2014/08/01/raspberry-pi-home-server-index/

I don't use all of the above. it's too much crap for one machine. I follow most of steps 2, 3, 6, 14



## raspberry pi speech rec

* https://wolfpaulus.com/journal/embedded/raspberrypi2-sr/ - really great tutorial for getting spinx setup on raspberry pi
* http://cmusphinx.sourceforge.net/wiki/raspberrypi   - some useful bits around sound handling
* http://cmusphinx.sourceforge.net/wiki/tutorialtuning  - haven't tried tuning but this gives good pointers possibly worth trying


## LIFX lighting

* https://github.com/magicmonkey/lifxjs
* https://github.com/MariusRumpf/node-lifx
* https://lan.developer.lifx.com/docs


## further research

I haven't tried these yet but they might be worth pursuing.


### send audio over network with netcat and sox
It might be better to buy a more powerful machine than raspberry pi which is dedicated to speech recognition.
The idea is the raspberry pi nodes become simple streaming microphones which pass the data along to a processing node. 

* https://ubuntuforums.org/archive/index.php/t-2037923.html
* http://www.linuxquestions.org/questions/slackware-14/send-audio-over-network-888169/
* http://www.aeronetworks.ca/2015/09/audio-networking-with-sox-and-netcat.html
* https://prupert.wordpress.com/2010/08/02/stream-live-audio-from-a-microphone-in-near-real-time-in-ubuntu/


### kaldi speech rec
supposedly more accurate than sphinx

* https://github.com/kaldi-asr/kaldi
