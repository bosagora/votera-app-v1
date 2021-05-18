import { useNavigation } from '@react-navigation/core';
import React, { useContext, useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import TabBarContainer from '~/components/status/TabBar';
import { ProposalContext } from '~/contexts/ProposalContext';
import {
    Enum_Activity_Type,
    Enum_Proposal_Status,
    SummarizeResponse,
    useGetSummarizeLazyQuery,
} from '~/graphql/generated/generated';
import AssessScreen from '~/screens/proposal/Assess/AssessScreen';
import Discussion from '~/screens/proposal/Discussion';
import Info from '~/screens/proposal/Info';
import VoteScreen from '~/screens/proposal/Vote/VoteScreen';
import { ProposalType } from '~/types/proposalType';
import getString from '~/utils/locales/STRINGS';

type HeightType = string | number;
interface ProposalContentProps {
    isPreview?: boolean;
    previewData?: ProposalType;
    discussionAId?: string;
    noticeAId?: string;
}
const ProposalContent = (props: ProposalContentProps) => {
    const navigation = useNavigation();
    const [index, setIndex] = useState(0);
    const { discussionAId, noticeAId, isPreview, previewData } = props;
    const { proposal, fetchProposal } = useContext(ProposalContext);

    const [routes] = useState([
        { key: 'info', title: getString('제안내용') },
        { key: 'discussion', title: getString('논의하기') },
        {
            key: 'vote',
            title: proposal?.status.indexOf('ASSESS') !== -1 ? getString('평가하기') : getString('투표하기'),
        },
    ]);
    const [sceneHeight, setSceneHeight] = useState<HeightType>('auto');
    const [tab0Height, setTab0Height] = useState<HeightType>('auto');
    const [tab1Height, setTab1Height] = useState<HeightType>('auto');
    const [tab2Height, setTab2Height] = useState<HeightType>('auto');

    const [getAssessResult, { data: assessResultData, refetch: refetchAssess }] = useGetSummarizeLazyQuery({
        fetchPolicy: 'cache-and-network',
    });

    useEffect(() => {
        if (proposal) {
            proposal.activities?.forEach((activity) => {
                if (activity?.type === Enum_Activity_Type.Survey) {
                    getAssessResult({
                        variables: { id: activity.id },
                    });
                }
            });
        }
    }, [proposal]);

    const setCurrentTabHeight = (newHeight: HeightType) => {
        const deviceHeight = Dimensions.get('window').height;
        const tabHeight = newHeight !== 'auto' && newHeight < deviceHeight ? deviceHeight : newHeight;
        if (sceneHeight !== tabHeight) {
            setSceneHeight(tabHeight);
        }
    };

    const _onTabChange = (index: number) => {
        switch (index) {
            case 0:
                setCurrentTabHeight(tab0Height);
                break;
            case 1:
                setCurrentTabHeight(tab1Height);
                break;
            case 2:
                setCurrentTabHeight(tab2Height);
                break;
        }
    };

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'info':
                return (
                    <Info
                        previewData={previewData || proposal}
                        isPreview={!!previewData}
                        assessResultData={assessResultData?.summarize as SummarizeResponse}
                        onLayout={setTab0Height}
                    />
                );
            case 'discussion':
                if (discussionAId)
                    return (
                        <Discussion
                            id={discussionAId}
                            onLayout={setTab1Height}
                            moveToNotice={() => navigation.navigate('Notice', { id: noticeAId })}
                        />
                    );
            case 'vote':
                if (
                    (proposal?.status === Enum_Proposal_Status.Assess ||
                        proposal?.status === Enum_Proposal_Status.PendingAssess) &&
                    proposal.id
                ) {
                    return (
                        <AssessScreen
                            assessResultData={assessResultData?.summarize as SummarizeResponse}
                            onLayout={setTab2Height}
                            refetchAssess={() => {
                                if (refetchAssess) refetchAssess();
                            }}
                            onChangeStatus={() => {
                                if (fetchProposal) fetchProposal(proposal.proposalId || '');
                                setIndex(0);
                            }}
                        />
                    );
                } else return <VoteScreen setIndex={setIndex} onLayout={setTab2Height} />;

            default:
                return null;
        }
    };

    return (
        <>
            <TabView
                swipeEnabled={!isPreview}
                sceneContainerStyle={{
                    paddingHorizontal: 22,
                    paddingTop: 25,
                    height: sceneHeight,
                    marginBottom: 60,
                }}
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={(index) => {
                    setIndex(index);
                    _onTabChange(index);
                }}
                lazy
                renderTabBar={(props) => !isPreview && <TabBarContainer {...props} />}
            />
        </>
    );
};

export default ProposalContent;
