import {
    Activity,
    ComponentCommonPeriod,
    Enum_Proposal_Status,
    Enum_Proposal_Type,
    Interaction,
    Maybe,
    Member,
    MemberRole,
    Scalars,
    UploadFile,
} from '~/graphql/generated/generated';

interface PeriodType {
    begin?: Date;
    end?: Date;
}

enum Temp_Proposal_Type {
    Temp = 'TEMP',
}

export type Enum_Extended_Proposal_Type = Temp_Proposal_Type | Enum_Proposal_Type;

enum Temp_Proposal_Status {
    Temp = 'TEMP',
}

export type Enum_Extended_Proposal_Status = Temp_Proposal_Status | Enum_Proposal_Status;

export interface ProposalType {
    name: Scalars['String'];
    description?: Maybe<Scalars['String']>;
    type: Enum_Extended_Proposal_Type;
    status: Enum_Extended_Proposal_Status;
    fundingAmount?: Maybe<Scalars['Float']>;
    proposalId?: Maybe<Scalars['String']>;
    logo?: { url: string };
    creator?: Maybe<Member>;
    assessPeriod?: PeriodType;
    votePeriod?: PeriodType;
    proposer_address?: Maybe<Scalars['String']>;
    proposal_fee_address?: Maybe<Scalars['String']>;
    proposal_fee?: Maybe<Scalars['Float']>;
    tx_hash_proposal_fee?: Maybe<Scalars['String']>;
    vote_start_height?: Maybe<Scalars['Int']>;
    vote_end_height?: Maybe<Scalars['Int']>;
    doc_hash?: Maybe<Scalars['String']>;
    vote_fee?: Maybe<Scalars['Float']>;
    tx_hash_vote_fee?: Maybe<Scalars['String']>;
    validators?: Maybe<Scalars['String']>;
    proposal_begin?: Maybe<Scalars['Int']>;
    attachment?: Maybe<Array<Maybe<UploadFile>>>;
    activities?: Maybe<Array<Maybe<Activity>>>;
    roles?: Maybe<Array<Maybe<MemberRole>>>;
    interactions?: Maybe<Array<Maybe<Interaction>>>;
}
