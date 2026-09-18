#!/bin/bash

USERNAME="$1"
PASSWORD="$2"
HOST="$3"

curl -v \
  -u "$USERNAME:$PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{ "textMessage": { "text": "This is an Automated Message from Team Lead for SIH SMS Testing" }, "phoneNumbers": ["+916289645167"] }' \
  "http://$HOST:8080/message"
