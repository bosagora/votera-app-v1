export const httpLinkURI = process.env.SERVER_URL;
export const webSocketURI = process.env.WEBSOCKET_URL;
export const feedSocketURI = process.env.FEEDSOCKET_URL;

export const walletFeeURL = process.env.WALLET_FEE_URL   || 'boawallet://app/proposalfeetransfer/';
export const walletDataURL = process.env.WALLET_DATA_URL || 'boawallet://app/votingfeetransfer/';
export const walletVoteURL = process.env.WALLET_VOTE_URL || 'boawallet://app/vote/';

export const voteResultURL = process.env.VOTE_RESULT_URL;