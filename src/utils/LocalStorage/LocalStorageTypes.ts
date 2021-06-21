import { PushStatusType } from "~/types/pushType";

export interface LocalStorageProps {
    user: LocalStorageUserProps;
    members: LocalStorageVoterCardProps[];
    groupBookmarks: string[];
    activityBookmarks: string[];
    searchHistory?: string[];
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
    id?: string;
    token: string;
    enablePush: boolean;
    tokenStatus: PushStatusType;
}

export interface LocalStorageProposalProps {
    id?: string;
    name: string;
    description: string;
    type: string;
    fundingFee?: string;
    startDate?: string;
    endDate?: string;
    status: string;
    timestamp: number;
}
