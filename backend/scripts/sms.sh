curl -X POST -u $1:$2 \
  -H "Content-Type: application/json" \
  -d '{ "textMessage": { "text": "This is an Automated Message from Team Lead for SIH SMS Testing" }, "phoneNumbers": ["+918159073507", "+916289645167", "+916290289863", "+918337049905", "+91747 7349159", "+917439407308"] }' \
  http://$3:8080/message
