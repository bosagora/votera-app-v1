import React, { useState, useContext } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import globalStyle from '~/styles/global';
import AssessAvg from '~/components/proposal/AssessAvg';
import ProposalCard from '~/components/proposal/ProposalCard';
import { Proposal, SummarizeResponse } from '~/graphql/generated/generated';
import { ProposalContext } from '~/contexts/ProposalContext';
import getString from '~/utils/locales/STRINGS';


interface Props {
    assessResultData: SummarizeResponse;
}

const LineComponent: React.FC = () => (
    <View style={{ height: 1, width: '100%', backgroundColor: 'rgb(235,234,239)', marginVertical: 30 }} />
);

const EvaluationResult = (props: Props) => {
    const { assessResultData } = props;
    const defaultStyle = { lineHeight: 25 };
    const themeContext = useContext(ThemeContext);

    const userAccount = useSelector((state: any) => state.userAccountState);
    const [assessAvg, setAssessAvg] = useState();
    const [proposals, setProposals] = useState([]);
    const { fetchProposal } = useContext(ProposalContext);
    const navigation = useNavigation();

    return (
        <View>
            <View style={{ alignItems: 'center', marginVertical: 38 }}>
                <Text style={[globalStyle.btext, { fontSize: 20 }]}>{getString('제안 평가가 완료되었습니다!')}</Text>
            </View>

            <AssessAvg assessResultData={assessResultData} />
            <LineComponent />

            <View>
                {proposals.length !== 0 && (
                    <>
                        <Text style={{ color: 'rgb(71,71,75)' }}>{getString('다른 제안보기')}</Text>
                        {proposals.map((item: Proposal, index: number) => (
                            <ProposalCard
                                key={'otherProposal_' + item.id}
                                title={item.name}
                                description={item.description || ''}
                                type={item.type}
                                status={item.status}
                                assessPeriod={item.assessPeriod!}
                                votePeriod={item.votePeriod!}
                                onPress={() => {
                                    fetchProposal(item.proposalId);
                                    navigation.navigate('ProposalDetail', { id: item.proposalId });
                                }}
                            />
                        ))}
                    </>
                )}
            </View>
        </View>
    );
};

export default EvaluationResult;
