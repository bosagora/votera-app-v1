import React, { useEffect, useState, useContext } from 'react';
import { View, Image } from 'react-native';
import styled, { ThemeContext } from 'styled-components/native';
import { useDispatch } from 'react-redux';
import { Button, Text } from 'react-native-elements';
import moment from 'moment';
import globalStyle from '~/styles/global';
import ActionCreators from '~/state/actions';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import getString from '~/utils/locales/STRINGS';

const EvalButton = styled.TouchableOpacity`
    width: 29px;
    height: 30px;
    border-radius: 10px;
    border-width: 2px;
    border-color: rgb(222, 212, 248);
    align-items: center;
    justify-content: center;
    ${(props) => {
        return {
            backgroundColor: props.isSelect ? props.theme.color.primary : 'white',
            borderWidth: props.isSelect ? 0 : 2,
        };
    }}
`;

interface Props {
    onEvaluating: (result: AssessResult[]) => void;
    // reviewData: ReviewProps;
}
interface EvalProps {
    evalName: string;
    score: number | undefined;
    onChange: (value: number) => void;
}

export interface AssessResult {
    key: number;
    value: number;
}

export enum Enum_Assess {
    COMPLETENESS = 0,
    REALIZATION,
    PROFITABILITY,
    ATTRACTIVENESS,
    EXPANSION,
}

const EVAL_LENGTH = 10;
const EvalComponent = (props: EvalProps) => {
    const [buttons, setButtons] = useState([] as any);

    useEffect(() => {
        let newButtons = [];
        let isSelect = false;
        for (let i = 0; i < EVAL_LENGTH; i++) {
            isSelect = props.score === i;
            newButtons.push(
                <EvalButton isSelect={isSelect} key={'button_' + i} onPress={() => props.onChange(i)}>
                    <Text
                        style={[globalStyle.rmtext, { fontSize: 14, color: isSelect ? 'white' : 'rgb(219,213,235)' }]}
                    >
                        {i + 1}
                    </Text>
                </EvalButton>,
            );
        }
        setButtons(newButtons);
    }, [props.score]);

    return (
        <View style={{ marginBottom: 24 }}>
            <Text>{props.evalName}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>{buttons}</View>
        </View>
    );
};

const Evaluating = (props: Props) => {
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();
    const { proposal } = useContext(ProposalContext);
    const { isGuest } = useContext(AuthContext);
    const [completeness, setCompleteness] = useState<number | undefined>(undefined);
    const [realization, setRealization] = useState<number | undefined>(undefined);
    const [profitability, setProfitability] = useState<number | undefined>(undefined);
    const [attractiveness, setAttractiveness] = useState<number | undefined>(undefined);
    const [expansion, setExpansion] = useState<number | undefined>(undefined);
    const [allCheck, setAllcheck] = useState(false);

    useEffect(() => {
        if (
            completeness !== undefined &&
            realization !== undefined &&
            profitability !== undefined &&
            attractiveness !== undefined &&
            expansion !== undefined
        )
        setAllcheck(true);
    }, [completeness, realization, profitability, attractiveness, expansion]);

    return (
        <View>
            <View style={{ alignItems: 'center' }}>
                <Text style={[globalStyle.btext, { fontSize: 20, color: themeContext.color.primary }]}>
                    {getString('제안 적합도 평가하기')}
                </Text>
                {/* <LText style={{ textAlign: 'center', lineHeight: 25, marginTop: 11.5 }}>{`해당 제안을 평가해주세요.\n평가된 평균점수가`}<MText style={{ color: themeContext.color.main }}>70점 이상일 경우</MText>{`에 한해\n정식제안으로 오픈됩니다.`}</LText> */}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 28 }}>
                <Text>{getString('평가기간')}</Text>
                <Text style={[globalStyle.ltext, { marginLeft: 19 }]}>
                    {`${moment(proposal?.assessPeriod?.begin).format('YYYY.MM.DD')} - ${moment(
                        proposal?.assessPeriod?.end,
                    ).format('YYYY.MM.DD')}`}
                </Text>
            </View>

            <View style={{ marginTop: 63 }}>
                <EvalComponent evalName={getString('제안완성도')} score={completeness} onChange={setCompleteness} />
                <EvalComponent evalName={getString('실현가능성')} score={realization} onChange={setRealization} />
                <EvalComponent evalName={getString('수익성')} score={profitability} onChange={setProfitability} />
                <EvalComponent evalName={getString('매력도')} score={attractiveness} onChange={setAttractiveness} />
                <EvalComponent evalName={getString('확장가능성')} score={expansion} onChange={setExpansion} />
            </View>

            <View style={{ alignItems: 'center', marginTop: 22 }}>
                <Button
                    onPress={() => {
                        if (isGuest) {
                            dispatch(
                                ActionCreators.snackBarVisibility({
                                    visibility: true,
                                    text: getString('둘러보기 중에는 사용할 수 없습니다'),
                                }),
                            );
                        } else {
                            props.onEvaluating([
                                { key: Enum_Assess.COMPLETENESS, value: completeness },
                                { key: Enum_Assess.REALIZATION, value: realization },
                                { key: Enum_Assess.PROFITABILITY, value: profitability },
                                { key: Enum_Assess.ATTRACTIVENESS, value: attractiveness },
                                { key: Enum_Assess.EXPANSION, value: expansion },
                            ]);
                        }
                    }}
                    icon={
                        <Image
                            style={{ tintColor: allCheck ? themeContext.color.primary : 'rgb(219,213,235)' }}
                            source={require('@assets/icons/checkIcon.png')}
                        />
                    }
                    title={getString('평가하기')}
                    titleStyle={[
                        globalStyle.btext,
                        {
                            fontSize: 20,
                            color: allCheck ? themeContext.color.primary : 'rgb(219,213,235)',
                            marginLeft: 6,
                        },
                    ]}
                    type="clear"
                />
            </View>
        </View>
    );
};

export default Evaluating;
