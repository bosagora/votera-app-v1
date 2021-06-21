import * as boasdk from 'boa-sdk-ts';
import { LinkDataWithProposalFee, LinkDataWithProposalData, LinkDataWithVoteData } from 'boa-sdk-ts';
import { SmartBuffer } from 'smart-buffer';

interface QrcodeValidatorVoterCard {
    validator: string;
    address: string;
    expires: string;
    signature: string;
}

interface QrcodeValidatorLogin {
    private_key: string;
    voter_card: QrcodeValidatorVoterCard;
}

interface QrcodeValidatorVote {
    app: string;
    height: string;
    value: string;
    validator: string;
    signature: string;
}

export class ValidatorLogin {
    validator: string;
    private_key: boasdk.SecretKey;
    voter_card: boasdk.VoterCard;

    constructor(validator: string, private_key: boasdk.SecretKey, voter_card: boasdk.VoterCard ) {
        this.validator = validator;
        this.private_key = private_key;
        this.voter_card = voter_card;
    }

    toString(): string {
        const data = {
            validator: this.validator,
            private_key: this.private_key.toString(false),
            voter_card: this.getStringVoterCard(),
        };
        return JSON.stringify(data);
    }

    getStringVoterCard(): string {
        const bytes = new SmartBuffer();
        this.voter_card.serialize(bytes);
        return bytes.toString('base64');
    }

    static fromString(data: string): ValidatorLogin {
        const parsed = JSON.parse(data);
        if (!parsed.validator || !parsed.private_key || !parsed.voter_card) {
            throw new Error('invalid ValidatorLogin');
        }

        const validator = parsed.validator;
        const private_key = new boasdk.SecretKey(parsed.private_key);
        const bytes = SmartBuffer.fromBuffer(Buffer.from(parsed.voter_card, 'base64'));
        const voter_card = boasdk.VoterCard.deserialize(bytes);

        return new ValidatorLogin(validator, private_key, voter_card);
    }
}

export interface ValidatorVote {
    validator: string;
    encryptionKey: boasdk.EncryptionKey;
}

const VOTERA_APP = 'Votera';

export function parseQrcodeValidatorLogin(data: string): ValidatorLogin {
    const qrdata = JSON.parse(data) as QrcodeValidatorLogin;
    if (!qrdata.private_key || !qrdata.voter_card) {
        throw new Error('invalid login data');
    }
    const qrvcard = qrdata.voter_card;
    if (!qrvcard.validator || !qrvcard.address || !qrvcard.expires || !qrvcard.signature) {
        throw new Error('invalid login data');
    }

    const private_key = new boasdk.SecretKey(qrdata.private_key);
    const validator = new boasdk.PublicKey(qrvcard.validator);
    const temporary_key = boasdk.KeyPair.fromSeed(private_key);
    const address = temporary_key.address;
    if (address.toString() !== qrvcard.address) {
        throw new Error('VoteCard.address inconsistent');
    }
    const expires = new Date(qrvcard.expires);
    const signature = new boasdk.Signature(qrvcard.signature);
    const voter_card = new boasdk.VoterCard(validator, address, qrvcard.expires, signature);
    if (!voter_card.verify()) {
        throw new Error('VoterCard failed to verify');
    }
    if (Date.now() > expires.getTime()) {
        throw new Error('VoterCard expired');
    }

    return new ValidatorLogin(validator.toString(), private_key, voter_card);
}

export function parseQrcodeValidatorVote(data: string): ValidatorVote {
    const qrdata = JSON.parse(data) as QrcodeValidatorVote;
    if (!qrdata.app || qrdata.app !== VOTERA_APP) {
        throw new Error('unknown App for vote');
    }
    if (!qrdata.height || !qrdata.value || !qrdata.validator || !qrdata.signature) {
        throw new Error('invalid vote data');
    }
    const height = new boasdk.Height(qrdata.height);
    if (boasdk.JSBI.lessThan(height.value, boasdk.JSBI.BigInt(0))) {
        throw new Error('invalid vote data');
    }
    const value = new boasdk.Hash(qrdata.value);
    const validator = new boasdk.PublicKey(qrdata.validator);
    const signature = new boasdk.Signature(qrdata.signature);

    const encryptionKey = new boasdk.EncryptionKey(qrdata.app, height, value, validator, signature);
    if (!encryptionKey.verify()) {
        throw new Error('EncryptionKey failed to verify');
    }

    return {
        validator: validator.toString(),
        encryptionKey,
    };
}

export function makeProposalFeeDataLinkData(proposal_id: string, proposer: string, fee_address: string, fee: string): LinkDataWithProposalFee {
    const feeData = new boasdk.ProposalFeeData(VOTERA_APP, proposal_id);
    const proposer_address = new boasdk.PublicKey(proposer);
    const destination =  new boasdk.PublicKey(fee_address);
    const amount = boasdk.JSBI.BigInt(fee);

    return feeData.getLinkData(proposer_address, destination, amount);
}

interface SystemProposalData {
    proposal_id: string;
    title: string;
    start: number;
    end: number;
    doc_hash: string;
}

export function makeSystemProposalDataLinkData(proposal: SystemProposalData, proposer: string, validators: string[], vote_fee: string): LinkDataWithProposalData {
    const voting_fee = boasdk.JSBI.divide(boasdk.JSBI.BigInt(vote_fee), boasdk.JSBI.BigInt(validators.length));
    const proposalData = new boasdk.ProposalData(
        VOTERA_APP,
        boasdk.ProposalType.System,
        proposal.proposal_id,
        proposal.title,
        boasdk.JSBI.BigInt(proposal.start),
        boasdk.JSBI.BigInt(proposal.end),
        new boasdk.Hash(proposal.doc_hash),
        boasdk.JSBI.BigInt(0),
        boasdk.JSBI.BigInt(0),
        boasdk.JSBI.BigInt(vote_fee),
        new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
        new boasdk.PublicKey(proposer),
        new boasdk.PublicKey(proposer),
    );

    return proposalData.getLinkData(new boasdk.PublicKey(proposer), validators.map((validator) => new boasdk.PublicKey(validator)), voting_fee);
}

interface FundProposalData {
    proposal_id: string;
    title: string;
    start: number;
    end: number;
    doc_hash: string;
    fund_amount: string;
    proposal_fee: string;
    tx_hash_proposal_fee: string;
}

export function makeFundProposalDataLinkData(proposal: FundProposalData, proposer: string, fee_address: string, validators: string[], vote_fee: string): LinkDataWithProposalData {
    const voting_fee = boasdk.JSBI.divide(boasdk.JSBI.BigInt(vote_fee), boasdk.JSBI.BigInt(validators.length));
    const proposalData = new boasdk.ProposalData(
        VOTERA_APP,
        boasdk.ProposalType.Fund,
        proposal.proposal_id,
        proposal.title,
        boasdk.JSBI.BigInt(proposal.start),
        boasdk.JSBI.BigInt(proposal.end),
        new boasdk.Hash(proposal.doc_hash),
        boasdk.JSBI.BigInt(proposal.fund_amount),
        boasdk.JSBI.BigInt(proposal.proposal_fee),
        boasdk.JSBI.BigInt(vote_fee),
        new boasdk.Hash(proposal.tx_hash_proposal_fee),
        new boasdk.PublicKey(proposer),
        new boasdk.PublicKey(fee_address),
    );

    return proposalData.getLinkData(new boasdk.PublicKey(proposer), validators.map((validator) => new boasdk.PublicKey(validator)), voting_fee);
}

export enum VOTE_SELECT {
    BLANK,
    YES,
    NO,
}

export function makeVoteLinkData(proposal_id: string, validator_login: ValidatorLogin, validator_vote: ValidatorVote, vote: VOTE_SELECT, sequence: number): LinkDataWithVoteData {
    let ballotSelect = (vote === VOTE_SELECT.YES) ? Buffer.from([boasdk.BallotData.YES]) : (vote === VOTE_SELECT.NO) ? Buffer.from([boasdk.BallotData.NO]) : Buffer.from([boasdk.BallotData.BLANK]);

    const key_encrypt = boasdk.Encrypt.createKey(validator_vote.encryptionKey.value.data, proposal_id);
    const ballot = boasdk.Encrypt.encrypt(ballotSelect, key_encrypt);
    const ballot_data = new boasdk.BallotData(VOTERA_APP, proposal_id, ballot, validator_login.voter_card, sequence);
    ballot_data.signature = validator_login.private_key.sign<boasdk.BallotData>(ballot_data);

    return ballot_data.getLinkData();
}

export const BOA_DECIMAL = boasdk.JSBI.BigInt(10000000);
export const BOA_ZERO = boasdk.JSBI.BigInt(0);
const LENGTH_DECIMAL = 7;

export function AmountToString(amount: boasdk.JSBI | undefined | null, comma: boolean = false): string {
    if (!amount) return '0';
    const share = boasdk.JSBI.divide(amount, BOA_DECIMAL);
    const remain = boasdk.JSBI.remainder(amount, BOA_DECIMAL);
    const tx_share = (comma) ? share.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : share.toString();
    if (boasdk.JSBI.equal(remain, BOA_ZERO)) {
        return tx_share;
    } else {
        let tx_remain = remain.toString();
        if (tx_remain.length < LENGTH_DECIMAL) {
            tx_remain = tx_remain.padStart(LENGTH_DECIMAL, '0');
        }
        return tx_share + '.' + tx_remain.replace(/0+$/g, '');
    }
}

export function StringToAmount(amount: string | null | undefined): boasdk.JSBI {
    if (!amount || amount === '') return boasdk.JSBI.BigInt(0);
    const numbers = amount.replace(/,/gi, '').split('.');
    if (numbers.length == 1) {
        return boasdk.JSBI.multiply(boasdk.JSBI.BigInt(numbers[0]), BOA_DECIMAL);
    } else if (numbers.length == 2) {
        let tx_remain = numbers[1];
        if (tx_remain.length > LENGTH_DECIMAL) {
            tx_remain = tx_remain.slice(0, LENGTH_DECIMAL);
        } else if (tx_remain.length < LENGTH_DECIMAL) {
            tx_remain = tx_remain.padEnd(LENGTH_DECIMAL, '0');
        }
        const share = boasdk.JSBI.multiply(boasdk.JSBI.BigInt(numbers[0]), BOA_DECIMAL);
        return boasdk.JSBI.add(share, boasdk.JSBI.BigInt(tx_remain));
    } else {
        throw new Error('invalid number format');
    }
}

export function StringToAmountFormat(amount: string | null | undefined): string {
    return AmountToString(boasdk.JSBI.BigInt(amount || '0'), true);
}

export function calculateProposalFee(amount: boasdk.JSBI, ratio: string): boasdk.JSBI {
    const fundRatio = StringToAmount(ratio);
    const proposalFee = boasdk.JSBI.divide(boasdk.JSBI.multiply(amount, fundRatio), BOA_DECIMAL);
    return proposalFee;
}
