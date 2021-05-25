/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import { Enum_Post_Status } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';

interface CommentCardProps {
    description: string;
    status: Enum_Post_Status | 'REPORTED'; // 내가 신고('REPORTED')했거나, 신고가 되어 'BLOCKED'된 상태
    isShowContents: boolean;
}

/*
<CommentContent status={status} isShowContents={isShowContents} description={description} />
*/

const styles = StyleSheet.create({
    font: { color: 'rgb(71, 71, 75)', fontSize: 13 },
    report: { alignItems: 'center', height: 72, justifyContent: 'center' },
});

const CommentCardContent = (props: CommentCardProps): any => {
    const { description, isShowContents, status } = props;

    return (
        <View style={{ paddingBottom: 18 }}>
            {status === Enum_Post_Status.Open &&
                (isShowContents ? (
                    <Text style={styles.font}>{description}</Text>
                ) : (
                    <View style={styles.report}>
                        <Text style={styles.font}>{getString('내가 신고한 답글입니다&#46;')}</Text>
                    </View>
                ))}

            {status === 'REPORTED' &&
                (isShowContents ? (
                    <Text style={styles.font}>{description}</Text>
                ) : (
                    <View style={styles.report}>
                        <Text style={styles.font}>{getString('내가 신고한 답글입니다&#46;')}</Text>
                    </View>
                ))}
        </View>
    );
};

export default CommentCardContent;
