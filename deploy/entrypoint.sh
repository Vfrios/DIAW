#!/bin/sh
set -eu

: "${PORT:=10000}"
export PORT
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
nginx -t
nginx -g 'daemon on;'
exec node /app/deploy/orquestrador.js
