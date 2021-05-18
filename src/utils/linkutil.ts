import * as Linking from 'expo-linking';
import { LinkDataWithProposalFee, LinkDataWithProposalData, LinkDataWithVoteData } from 'boa-sdk-ts/lib/modules/wallet/LinkData'
import { walletFeeURL, walletDataURL, walletVoteURL } from '../../config/ServerConfig';
import { getProposalVoteResultURL } from '~/utils/agoraconf';

export async function openProposalFeeLink(linkData: LinkDataWithProposalFee) {
    const redirectUrl = `${walletFeeURL}?linkData=${encodeURIComponent(JSON.stringify(linkData))}`;
    return await Linking.openURL(redirectUrl);
}

export async function openProposalDataLink(linkData: LinkDataWithProposalData) {
    const redirectUrl = `${walletDataURL}?linkData=${encodeURIComponent(JSON.stringify(linkData))}`;
    return await Linking.openURL(redirectUrl);
}

export async function openProposalVoteLink(linkData: LinkDataWithVoteData) {
    const redirectUrl = `${walletVoteURL}?linkData=${encodeURIComponent(JSON.stringify(linkData))}`;
    return await Linking.openURL(redirectUrl);
}

export async function openProposalResultLink(proposalId: string) {
    const redirectUrl = getProposalVoteResultURL(proposalId);
    return await Linking.openURL(redirectUrl);
}
