## Install the project packages

npm install

## Create or reset the Database (model)

node model.js --create

## Check the Database with a simple query

node model.js

## Run de server

npm start

## Check the API in the browser

http://localhost:9000/

## Test some queries

query{hello}
query{users{name}}

## Practice by adding a new method in controllers

addUser


APP ID: circutic-clvxecx

API-Key: gftcV2jEm31shQXPQMwEswNSzXRC4V72YBRGJaPShJcGUvndrldiVRxnit74eZ7B

Snippet: 
curl --location --request POST 'https://eu-west-2.aws.data.mongodb-api.com/app/data-stcgg/endpoint/data/v1/action/findOne' \
--header 'Content-Type: application/json' \
--header 'Access-Control-Request-Headers: *' \
--header 'api-key: gftcV2jEm31shQXPQMwEswNSzXRC4V72YBRGJaPShJcGUvndrldiVRxnit74eZ7B' \
--data-raw '{
    "collection":"Device",
    "database":"CircuticDB",
    "dataSource":"circutic",
    "projection": {"_id": 1}
}'


