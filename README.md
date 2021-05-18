# votera-app
Votera Mobile App

## build 하기 전에 codegen이 되어 있는지 확인 필요

$ yarn run codegen
$ yarn start

## .env 파일에 넣어야 되는 정보

|Name|Description|
|----|-----------|
|SERVER_URL|Votera Server의 Url|
|WEBSOCKET_URL|Votera Server의 pubsub url|
|FEEDSOCKET_URL|Votera Feed Server의 pubsub url|
|WALLET_FEE_URL|proposal fee를 입금할 때 호출하는 wallet url|
|WALLET_DATA_URL|proposal data와 vote fee를 입금할 때 호출하는 wallet url|
|WALLET_VOTE_URL|사용자가 vote 할 때 호출하는 wallet url|
|VOTE_RESULT_URL|투표 결과를 보여줄 url (votera server의 agora의 정보로 overwrite 됨)|

