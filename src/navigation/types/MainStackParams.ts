import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Enum_Proposal_Status } from '~/graphql/generated/generated';

export type MainStackParams = {
    Home: { where: { status: Enum_Proposal_Status } };
    MyProposals: undefined;
    ProposalDetail: { id: string };
    ProposalList: { type: 'MY' | 'TEMP' | 'JOIN'; query: object };
    Search: undefined;
    Feed: undefined;
    Settings: undefined;
    Notice: { id: string };
    CreateNotice: { id: string };
};

export type MainNavProps<T extends keyof MainStackParams> = {
    navigation: StackNavigationProp<MainStackParams, T>;
    route: RouteProp<MainStackParams, T>;
};
