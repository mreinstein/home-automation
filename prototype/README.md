a voice interaction agent based on snowboy for wakeword detection, watson for speech to text,
and amazon polly for text to speech.

```
|- resources/
|- *.pmdl
|- home-automation.service
|- index.js
|- INSTALL.md
|- install.sh
`- wpa_supplicant.conf
```

* `resources/` stuff needed by snowboy
* `*.pmdl` snowboy models for wakeword detection
* `home-automation.service` systemd install script
* `index.js` the entry point for the interaction agent
* `INSTALL.md` install instructions
* `install.sh` linux shell script to install dependencies


## recording audio for snowboy

You'll need to do this 3 times, recording the hotword for a given person
into `out.wav`, `out2.wav`, `out3.wav`

```bash
rec -r 16000 -c 1 -e signed-integer -b 16 -t wav out.wav
```
