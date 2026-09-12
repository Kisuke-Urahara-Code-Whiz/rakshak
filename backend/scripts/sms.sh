curl -X POST -u $1:$2 \
  -H "Content-Type: application/json" \
  -d '{ "textMessage": { "text": "This is an Automated Message from Team Lead for SIH SMS Testing" }, "phoneNumbers": ["+916289645167"] }' \
  http://$3:8080/message
