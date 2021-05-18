/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-elements';
import CommentCardInfo from './CommentCardInfo';
import CommentContent from './CommentCardContent';
import { Enum_Post_Status } from '~/graphql/generated/generated'

interface CommentCardProps {
    postId: string;
    activityId: string;
    nickname: string;
    description: string;
    status: Enum_Post_Status | 'REPORTED'; // 내가 신고('REPORTED')했거나, 신고가 되어 'BLOCKED'된 상태
    created: Date;
}

const styles = StyleSheet.create({
    contents: {
        backgroundColor: 'white',
        paddingTop: 35,
    },
});

const CommentCard = (props: CommentCardProps): any => {
    const [isShowContents, setIsShowContents] = useState<boolean>(true);
    const { postId, activityId, nickname, description, created, status } = props;

    return (
        <View style={styles.contents}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 11 }}>
                <Text style={{ color: 'black', fontSize: 10, fontFamily: 'GmarketSansTTFMedium' }}>{nickname}</Text>
                <CommentCardInfo
                    activityId={activityId}
                    postId={postId}
                    created={created}
                    status={status}
                    isShowContents={isShowContents}
                    setIsShowContents={setIsShowContents}
                />
            </View>
            <CommentContent status={status} isShowContents={isShowContents} description={description} />
            <Divider />
        </View>
    );
};

export default CommentCard;
