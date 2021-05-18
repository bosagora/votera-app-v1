/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { View } from 'react-native';

import StatusMark from './StatusMark';
import ProgressMark from './ProgressMark';
import DdayMark from './DdayMark';
import globalStyle from '~/styles/global';
import { Enum_Proposal_Type } from '~/graphql/generated/generated';
import { Enum_Extended_Proposal_Status } from '~/types/proposalType';

interface StatusBarProps {
    type: Enum_Proposal_Type;
    status: Enum_Extended_Proposal_Status;
    deadline: number | Date;
}

/**
 *  <StatusBar type="BUSINESS" status="VOTING" />
    <StatusBar type="BUSINESS" status="ASSESS" />
    <StatusBar type="SYSTEM" status="IN_PROGRESS" />
 */

const StatusBar = (props: StatusBarProps): any => {
    const { type, status, deadline } = props;
    return (
        <View style={[globalStyle.flexRowBetween, { flex: 1 }]}>
            <View style={globalStyle.flexRowAlignCenter}>
                <StatusMark type={type} transparent={false} />
                <ProgressMark status={status} type={type} />
            </View>
            {status !== 'TEMP' && <DdayMark deadline={deadline} type={type} />}
        </View>
    );
};

export default StatusBar;
