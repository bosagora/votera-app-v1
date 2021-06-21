import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CreateProposal from '~/screens/create/CreateProposalScreen';
import { CreateStackParams } from './types/CreateStackParams';
import CalendarScreen from '~/screens/create/calendar/CalendarScreen';
import globalStyle from '~/styles/global';
import ProposalPreviewScreen from '~/screens/create/ProposalPreviewScreen';
import UpdateNode from '~/screens/create/UpdateNode';
import ProposalPayment from '../screens/create/ProposalPaymentScreen';

const CreateStack = createStackNavigator<CreateStackParams>();

export const CreateScreens = (): JSX.Element => (
    <CreateStack.Navigator
        screenOptions={{
            headerTitleStyle: { ...globalStyle.headerTitle },
            headerLeftContainerStyle: { paddingLeft: 20 },
            headerRightContainerStyle: { paddingRight: 20 },
            headerTitleAlign: 'center',
        }}
    >
        <CreateStack.Screen name="CreateProposal" component={CreateProposal} />
        <CreateStack.Screen name="ProposalPayment" component={ProposalPayment} />
        <CreateStack.Screen name="ProposalPreview" component={ProposalPreviewScreen} />
        <CreateStack.Screen name="Calendar" component={CalendarScreen} />
        <CreateStack.Screen name="UpdateNode" component={UpdateNode} />
    </CreateStack.Navigator>
);
