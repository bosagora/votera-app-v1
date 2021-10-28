import * as Linking from 'expo-linking';
import { LinkDataWithProposalFee, LinkDataWithProposalData, LinkDataWithVoteData } from 'boa-sdk-ts'
import { walletFeeURL, walletDataURL, walletVoteURL } from '../../config/ServerConfig';
import { getProposalVoteResultURL } from '~/utils/agoraconf';

export async function openProposalFeeLink(linkData: LinkDataWithProposalFee) {
    const redirectUrl = `${walletFeeURL}${encodeURIComponent(JSON.stringify(linkData))}`;
    return await Linking.openURL(redirectUrl);
}

export async function openProposalDataLink(linkData: LinkDataWithProposalData) {
    const redirectUrl = `${walletDataURL}${encodeURIComponent(JSON.stringify(linkData))}`;
    return await Linking.openURL(redirectUrl);
}

export async function openProposalVoteLink(linkData: LinkDataWithVoteData) {
    const redirectUrl = `${walletVoteURL}${encodeURIComponent(JSON.stringify(linkData))}`;
    return await Linking.openURL(redirectUrl);
}

export async function openProposalResultLink(proposalId: string) {
    const redirectUrl = getProposalVoteResultURL(proposalId);
    return await Linking.openURL(redirectUrl);
}
