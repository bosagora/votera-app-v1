import { Enum_Proposal_Status } from '../generated/generated';

export const OpenWhere = { status: Enum_Proposal_Status.Assess };

export const ProjectWhere = {
    status_nin: [
        Enum_Proposal_Status.PendingAssess,
        Enum_Proposal_Status.Assess,
        Enum_Proposal_Status.Deleted,
        Enum_Proposal_Status.Cancel,
    ],
};
