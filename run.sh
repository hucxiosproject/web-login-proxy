#!/bin/bash
source /data/env
eval "$(weave proxy-env)"

docker rm -f web-login-proxy
docker build -t web-login-proxy .
docker run -d --name web-login-proxy \
  -p 5003:5000 \
  -p 3000:3000 \
  -e WEB_PORT=5003 \
	-e VIRTUAL_HOST="$LOGIN_PROXY_VIRTUAL_HOST" \
	-v /data/volumes/web-login-proxy:/data \
	web-login-proxy

