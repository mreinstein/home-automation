
Notes, links, and prototypes related to my home automation system experiments.

```
|- chromecasting/
|- prototype/
|- sphinx-prototype/
|- asound.conf
`- wpa_supplicant.conf
```

* `prototype/` watson/snowboy prototype (v2)
* `sphinx-prototype/` CMU Sphinx prototype (v1)
* `asound.confg`  my `~/.asound.rc` file, configured to use MXL AC404 microphone
* `wpa_supplicant.conf` my `/etc/wpa_supplicant/wpa_supplicant.conf` file, with AP and passphrase removed


## miscellaneous
[using rsync to backup to an external drive](http://serverfault.com/questions/25329/using-rsync-to-backup-to-an-external-drive)

[btsync, the bittorrent client I'm using](https://itunes.apple.com/us/app/bittorrent-sync-file-transfer/id665156116)

how to make a raspberry pi bootable from a usb drive rather than booting off SD card: https://github.com/raspberrypi/documentation/blob/master/hardware/raspberrypi/bootmodes/msd.md

how to fix the keyboard when characters don't all show up: https://www.raspberrypi.org/forums/viewtopic.php?f=50&t=40294

(note to self: that crappy ihome keyboard I'm using is a 104 key generic)

https://www.raspberrypi.org/documentation/remote-access/ssh/passwordless.md

## bittorrent sync (resilio) setup

https://melgrubb.com/2016/12/11/rphs-v2-introduction/

I don't use all of the above. it's too much crap for one machine. I follow most of steps 2, 3, 6, 14


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


### lucida speech rec

lucida is marketing itself as an open source siri. it includes a speech recognition engine based on [kaldi](https://github.com/kaldi-asr/kaldi)
which I've heard from a few places is more accurate than CMU sphinx.

https://github.com/claritylab/lucida/tree/master/lucida/speechrecognition

