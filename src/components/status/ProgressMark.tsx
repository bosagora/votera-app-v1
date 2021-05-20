/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { Enum_Proposal_Type } from '~/graphql/generated/generated';
import { Enum_Extended_Proposal_Type, Enum_Extended_Proposal_Status } from '~/types/proposalType';
import getString from '~/utils/locales/STRINGS';

interface HeaderProps {
    status: Enum_Extended_Proposal_Status;
    type: Enum_Extended_Proposal_Type;
}
/*
<ProgressMark status="VOTING" type="BUSINESS" />
<ProgressMark status="IN_PROGRESS" type="SYSTEM" />
<ProgressMark status="ASSESS" type="SYSTEM" />
<ProgressMark status="CLOSED" type="SYSTEM" />
*/

export const getProposalStatusString = (status: Enum_Extended_Proposal_Status | undefined) => {
    switch (status) {
        case 'PENDING_VOTE':
            return getString('투표 준비중');
        case 'VOTE':
            return getString('투표중');
        case 'PENDING_ASSESS':
            return getString('결제 대기중');
        case 'ASSESS':
            return getString('사전평가중');
        case 'CLOSED':
            return getString('결과보기');
        case 'TEMP':
            return getString('작성중');
        default:
            return '';
    }
};

const HeaderInfo = (props: HeaderProps): JSX.Element => {
    const { status, type } = props;
    const themeContext = useContext(ThemeContext);

    const secondComponent = function (_status: string) {
        if (_status === 'CLOSED') {
            return (
                <Icon
                    type="font-awesome"
                    size={14}
                    name="angle-right"
                    style={{ paddingLeft: 9 }}
                    color={
                        type === Enum_Proposal_Type.Business ? themeContext.color.business : themeContext.color.system
                    }
                />
            );
        }
    };

    return (
        <View style={{ flexDirection: 'row' }}>
            <Text
                style={{
                    fontSize: 11,
                    color:
                        type === Enum_Proposal_Type.Business ? themeContext.color.business : themeContext.color.system,
                }}
            >
                {getProposalStatusString(status)}
            </Text>
            {secondComponent(status)}
        </View>
    );
};

export default HeaderInfo;
