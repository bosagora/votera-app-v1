import { Day } from '~/components/input/DatePicker';

export interface LocalStorageProps {
    user: LocalStorageUserProps;
    members: LocalStorageVoterCardProps[];
    groupBookmarks: string[];
    activityBookmarks: string[];
    searchHistory?: string[];
    feed: LocalStorageFeedProps;
}

export interface LocalStorageVoterCardProps {
    memberId: string;
    nodeName: string;
    validator: string;
    votercard: string;
    expiresIn: number;
}

export interface LocalStorageUserProps {
    userEmail?: string;
    userValidator?: string;
    userName?: string;
    enablePush?: boolean;
    feedReadTime?: number;
    locale?: string;
    memberId?: string;
}

export interface LocalStoragePushProps {
    id: string;
    token: string;
    enablePush: boolean;
    authorization?: string;
}

export interface LocalStorageFeedProps {
    isMyProposalsNews?: boolean;
    isLikeProposalsNews?: boolean;
    isNewProposalNews?: boolean;
    isEtcNews?: boolean;
}

export interface LocalStorageProposalProps {
    id?: string;
    name: string;
    description: string;
    type: string;
    fundingFee?: number;
    startDate?: string;
    endDate?: string;
    status: string;
    timestamp: number;
}
