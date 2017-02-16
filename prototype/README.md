a voice interaction agent based on snowboy for wakeword detection, watson for speech to text, 
and amazon polly for text to speech.

```
|- resources/
|- *.pmdl
|- home-automation.service
|- index.js
|- install.sh
`- wpa_supplicant.conf
```

* `resources/` stuff needed by snowboy
* `*.pmdl` snowboy models for wakeword detection
* `home-automation.service` systemd install script
* `index.js` the entry point for the interaction agent
* `install.sh` linux shell script to set up some dependencies needed by snowboy


## installation

```bash
./install.sh
```

## configure the voice interaction agent to run automatically at boot, restart on failure

```bash
sudo cp home-automation.service /lib/systemd/system/

sudo systemctl daemon-reload

sudo systemctl enable home-automation.service

sudo systemctl start home-automation.service
```

comment out the last 4 lines of `/etc/rsyslog.conf` to prevent an error message about "action 17 suspended" :

```bash
#daemon.*;mail.*;\ 
#       news.err;\
#       *.=debug;*.=info;\
#       *.=notice;*.=warn       |/dev/xconsole
```
