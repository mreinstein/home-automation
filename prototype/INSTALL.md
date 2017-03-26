## installation

```bash
./install.sh
```

comment out the last 4 lines of `/etc/rsyslog.conf` to prevent an error message about "action 17 suspended" :

```bash
#daemon.*;mail.*;\ 
#       news.err;\
#       *.=debug;*.=info;\
#       *.=notice;*.=warn       |/dev/xconsole
```
