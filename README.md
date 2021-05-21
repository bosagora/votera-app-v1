# votera-app
Votera Mobile App

## confirm run codegen before build

$ yarn run codegen
$ yarn start

## ENV varioable in .env file

|Name|Description|
|----|-----------|
|SERVER_URL|URL of Votera Server|
|WEBSOCKET_URL|PubSub URL of Votera Server|
|FEEDSOCKET_URL|PubSub URL of Votera Feed Server|
|WALLET_FEE_URL|wallet URL to invoke when deposit proposal fee|
|WALLET_DATA_URL|wallet URL to invoke when deposit vote fee and proposal data|
|WALLET_VOTE_URL|wallet URL to invoke when voting|
|VOTE_RESULT_URL|URL for vote result (it will be ignored when app fetches agora information (voteResultUrl) of votera server)|

