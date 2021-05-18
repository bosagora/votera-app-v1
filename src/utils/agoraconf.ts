import { httpLinkURI, voteResultURL } from '../../config/ServerConfig';
import { Agora } from '~/graphql/generated/generated';

let privacyTermUrl: string = `${httpLinkURI}/privacy.html`;
let userServiceTermUrl: string = `${httpLinkURI}/userService.html`;
let proposalVoteResultUrl: string = `${voteResultURL}/` + '${}';
let proposalFeeRatio: number = 0.01;


export function setAgoraConf(agora: Pick<Agora, 'privacyTermUrl' | 'userServiceTermUrl' | 'voteResultUrl' | 'ProposalFeeRatio'> | undefined) {
    if (!agora) {
        return;
    }

    if (agora.privacyTermUrl) {
        privacyTermUrl = agora.privacyTermUrl;
    }
    if (agora.userServiceTermUrl) {
        userServiceTermUrl = agora.userServiceTermUrl;
    }
    if (agora.voteResultUrl) {
        const fi = agora.voteResultUrl.indexOf('${');
        if (fi < 0) {
            proposalVoteResultUrl = agora.voteResultUrl + '${}';
        } else {
            const li = agora.voteResultUrl.indexOf('}', fi + 2);
            if (li < 0) {
                proposalVoteResultUrl = agora.voteResultUrl.substring(0, fi + 2) + '}';
            } else {
                proposalVoteResultUrl = agora.voteResultUrl.substring(0, fi + 2) + agora.voteResultUrl.substring(li); 
            }
        }
    }
    if (agora.ProposalFeeRatio) {
        if (agora.ProposalFeeRatio > 0 && agora.ProposalFeeRatio < 1) {
            proposalFeeRatio = agora.ProposalFeeRatio;
        }
    }
}

export function getPrivacyTermURL() {
    return privacyTermUrl;
}

export function getUserServiceTermURL() {
    return userServiceTermUrl;
}

export function getProposalVoteResultURL(proposalId: string) {
    const resultUrl = proposalVoteResultUrl.replace('${}', proposalId);
    return resultUrl;
}

export function getProposalFeeRatio() {
    return proposalFeeRatio;
}
