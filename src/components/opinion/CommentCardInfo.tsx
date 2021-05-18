/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-elements';
import { useDispatch } from 'react-redux';
import { Enum_Post_Status } from '~/graphql/generated/generated';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';
import ActionCreators from '~/state/actions';
import { AuthContext } from '~/contexts/AuthContext';
import { ProposalContext } from '~/contexts/ProposalContext';
import { sinceCalc } from '~/utils/time';

interface CommentCardInfoProps {
    postId: string;
    activityId: string;
    status: Enum_Post_Status | 'REPORTED'; // 내가 신고('REPORTED')했거나, 신고가 되어 'BLOCKED'된 상태
    created: Date;
    isShowContents: boolean;
    setIsShowContents: React.Dispatch<React.SetStateAction<boolean>>;
}

const CommentCardInfo = (props: CommentCardInfoProps): any => {
    const dispatch = useDispatch();
    const { postId, activityId, created, status, isShowContents, setIsShowContents } = props;
    const { isGuest } = useContext(AuthContext);
    const { reportPost } = useContext(ProposalContext);

    const report = () => {
        if (isGuest) {
            dispatch(ActionCreators.snackBarVisibility({
                visibility: true,
                text: '둘러보기 중에는 사용할 수 없습니다'
            }));
            return;
        }

        Alert.alert('이 게시물을 신고하시겠습니까?',
            '신고할 경우, 이 게시물은 회원님께 숨김 처리 됩니다. 신고가 누적되면 다른 참여자들에게도 숨김처리가 될 예정입니다.',
            [{
                text: '취소',
                onPress: () => {
                    console.log('cancel pressed');
                },
                style: 'cancel',
            }, {
                text: '신고',
                onPress: () => {
                    // console.log('신고하면 여기서 set바꿔줌', !isShowContents);
                    // setIsShowContents(!isShowContents);
                    reportPost(activityId, postId)
                        .then((succeeded) => {
                            if (succeeded) {
                                dispatch(ActionCreators.snackBarVisibility({
                                    visibility: true,
                                    text: '신고 처리가 완료되었습니다'
                                }));
                                // 사용자의 신고목록에 추가
                                // post 목록에서 표시하지 말아야 할 것으로 표시
                                setIsShowContents(!isShowContents);
                            } else {
                                dispatch(ActionCreators.snackBarVisibility({
                                    visibility: true,
                                    text: '신고 처리 중 오류가 발생했습니다'
                                }));
                            }
                        })
                        .catch((err) => {
                            console.log('catch exception while reportActivity : ', err);
                            dispatch(ActionCreators.snackBarVisibility({
                                visibility: true,
                                text: '신고 처리 중 오류가 발생했습니다'
                            }));
                        });
                },
            }]
        );
    };

    return (
        <View style={globalStyle.flexRowBetween}>
            {status === Enum_Post_Status.Open && <Text style={{ fontSize: 10 }}>{sinceCalc(created)}</Text>}
            {(status === 'REPORTED') && (
                <TouchableOpacity
                    onPress={() => {
                        setIsShowContents(!isShowContents);
                    }}
                >
                    {!!isShowContents || <Text style={{ fontSize: 10 }}>{getString('내용보기')}</Text>}
                    {!!isShowContents && <Text style={{ fontSize: 10 }}>{getString('내용숨기기')}</Text>}
                </TouchableOpacity>
            )}

            {(status === Enum_Post_Status.Open) && (
                <>
                    <View
                        style={{
                            marginLeft: 9,
                            borderLeftWidth: 1,
                            borderColor: 'rgb(220, 217, 227)',
                            width: 11,
                            height: 11,
                        }}
                    />

                    <TouchableOpacity
                        onPress={() => {
                            report();
                        }}
                    >
                        <Text style={{ fontSize: 10 }}>{getString('신고')}</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

export default CommentCardInfo;
