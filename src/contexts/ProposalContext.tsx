import React, { useState, useCallback, useContext } from 'react';
import {
    Proposal,
    VotePeriodPayload,
    useGetProposalByIdLazyQuery,
    useJoinProposalMutation,
    useReportPostMutation,
    Enum_Interaction_Type,
    Enum_Componentinteractionreport_Status
} from '~/graphql/generated/generated';
import { AuthContext } from './AuthContext';

type ProposalContextState = {
    proposal?: Proposal;
    estimatedPeriod?: VotePeriodPayload;
    isJoined: boolean;
    fetchProposal: (proposalId: string) => void;
    canJoinProposal: () => boolean;
    joinProposal: () => Promise<boolean>;
    isReported: (postId: string) => boolean;
    reportPost: (activityId: string, postId: string) => Promise<boolean>;
    encryptionBlockHeight: (proposal: Proposal | undefined) => number;
};

type ProposalProviderProps = {
    children: React.ReactNode;
};

export const ProposalContext = React.createContext<ProposalContextState>(null);

export const useProposal = (): Proposal | undefined => {
    const { proposal } = React.useContext(ProposalContext);
    return proposal;
};

let reportedPosts = new Set<string>();

function encryptionBlockHeight(proposal: Proposal | undefined) {
    return (proposal?.vote_end_height || 0) + 7;
}

export const DEFAULT_APP_NAME = 'Votera'

export const ProposalProvider = ({ children }: ProposalProviderProps): JSX.Element => {
    const { user } = useContext(AuthContext);
    const [proposalState, setProposalState] = useState<Proposal>();
    const [estimatedPeriod, setEstimatedPeriod] = useState<VotePeriodPayload>();
    const [isJoined, setIsJoined] = useState(false);

    const [getProposalDetail] = useGetProposalByIdLazyQuery({
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
        onCompleted: (data) => {
            if (data.proposalById) {
                const proposal = data.proposalById as Proposal;
                const finded = proposal.roles?.find((role) => role?.member?.id === user?.memberId);
                setProposalState(proposal);
                if (finded) setIsJoined(true);
            }
            if (data.reportedPosts) {
                for (let i = data.reportedPosts.length - 1; i >= 0; i -= 1) {
                    const postId = data.reportedPosts[i];
                    if (postId) {
                        reportedPosts.add(postId);
                    }
                }
            }
            if (data.estimatedVotePeriod) {
                const period = data.estimatedVotePeriod as VotePeriodPayload;
                setEstimatedPeriod(period);
            } else {
                setEstimatedPeriod(undefined);
            }
        },
    });

    const [joinProposalMutation] = useJoinProposalMutation();
    const [reportPostMutation] = useReportPostMutation();

    const fetchProposal = useCallback((proposalId: string) => {
        setProposalState(undefined);
        reportedPosts.clear();
        setEstimatedPeriod(undefined);
        getProposalDetail({ variables: { proposalId }});
    }, []);

    const canJoinProposal = useCallback(() => {
        return (user?.memberId && proposalState?.id) ? true : false;
    }, [proposalState?.id, user?.memberId]);

    const joinProposal = useCallback(async () => {
        try {
            if (user?.memberId && proposalState?.id) {
                const result = await joinProposalMutation({
                    variables: {
                        input: {
                            data: {
                                actor: user?.memberId,
                                id: proposalState?.id,
                            }
                        },
                    },
                });
                if (result.data?.joinProposal?.proposal) {
                    setIsJoined(true);
                    return true;
                }

                return false;
            }
            return false;
        } catch (e) {
            console.log('Join Failed... : ', e);
            return false;
        }
    }, [proposalState?.id, user?.memberId]);

    const isReported = useCallback((postId: string) => {
        return reportedPosts.has(postId);
    }, []);

    const reportPost = useCallback(async (activityId: string, postId: string): Promise<boolean> => {
        const data = await reportPostMutation({
            variables: {
                input: {
                    data: {
                        postId,
                        activityId,
                        proposalId : proposalState?.id || '',
                        actor: user?.memberId || '',
                    }
                }
            }
        });
        if (data.data?.reportPost?.interaction?.id) {
            reportedPosts.add(postId);
            // setProposalState in order to redraw proposal
            const newProposalState = {...(proposalState as Proposal)};
            setProposalState(newProposalState);
            return true;
        } else {
            return false;
        }
    }, [proposalState?.id, user?.memberId]);

    return (
        <ProposalContext.Provider
            value={{
                proposal: proposalState,
                isJoined,
                estimatedPeriod,
                fetchProposal,
                canJoinProposal,
                joinProposal,
                isReported,
                reportPost,
                encryptionBlockHeight,
            }}
        >
            {children}
        </ProposalContext.Provider>
    );
};
