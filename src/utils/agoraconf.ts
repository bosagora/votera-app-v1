import { JSBI } from 'boa-sdk-ts';
import { httpLinkURI, voteResultURL } from '../../config/ServerConfig';
import { Agora } from '~/graphql/generated/generated';
import { BOA_ZERO, BOA_DECIMAL } from './voterautil';

let privacyTermUrl: string = `${httpLinkURI}/privacy.html`;
let userServiceTermUrl: string = `${httpLinkURI}/userService.html`;
let proposalVoteResultUrl: string = `${voteResultURL}/` + '${}';
let proposalFeeRatio: string = '0.01';
let proposalFundMin : JSBI = BOA_ZERO;
let proposalFundMax : JSBI = JSBI.multiply(JSBI.BigInt(Number.MAX_SAFE_INTEGER), BOA_DECIMAL);


export function setAgoraConf(agora: Pick<Agora, 'privacyTermUrl' | 'userServiceTermUrl' | 'voteResultUrl' | 'ProposalFeeRatio' | 'ProposalFundMin' | 'ProposalFundMax'> | undefined) {
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
            proposalFeeRatio = agora.ProposalFeeRatio.toString();
        }
    }
    try {
        if (agora.ProposalFundMin || agora.ProposalFundMax) {
            let fundMin = proposalFundMin;
            let fundMax = proposalFundMax;
    
            if (agora.ProposalFundMin) {
                fundMin = JSBI.BigInt(agora.ProposalFundMin);
                if (JSBI.lessThan(fundMin, JSBI.BigInt(0))) {
                    fundMin = proposalFundMin;
                } else if (JSBI.greaterThan(fundMin, proposalFundMax)) {
                    fundMin = proposalFundMin;
                }
            }
            if (agora.ProposalFundMax) {
                fundMax = JSBI.BigInt(agora.ProposalFundMax);
                if (JSBI.lessThan(fundMax, fundMin)) {
                    fundMax = proposalFundMax;
                }
            }

            proposalFundMax = fundMax;
            proposalFundMin = fundMin;
        }
    } catch (e) {
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

export function isValidFundAmount(amount: JSBI | undefined | null): boolean {
    if (!amount) return false;
    if (JSBI.lessThan(amount, proposalFundMin)) return false;
    if (JSBI.greaterThan(amount, proposalFundMax)) return false;
    return true;
}
