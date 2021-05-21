import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { DateObject } from 'react-native-calendars';
import { ImagePickerResult } from 'expo-image-picker';
import { Enum_Proposal_Type, Proposal } from '~/graphql/generated/generated';
import { LocalStorageProposalProps } from '~/utils/LocalStorage/LocalStorageTypes';

export type CreateStackParams = {
    CreateProposal: {
        saveData?: LocalStorageProposalProps;
    };
    ProposalPayment: { id: string };
    ProposalPreview: {
        title: string;
        description: string;
        type: Enum_Proposal_Type;
        votePeriod?: {
            begin?: Date;
            end?: Date;
        };
        fundingAmount: string;
        logoImage?: ImagePickerResult;
        mainImage?: ImagePickerResult;
    };
    Calendar: {
        isAssess: boolean;
        returnData: ({ startDate, endDate }: { startDate: DateObject; endDate: DateObject }) => void;
    };
    UpdateNode: undefined;
};

export type CreateNavProps<T extends keyof CreateStackParams> = {
    navigation: StackNavigationProp<CreateStackParams, T>;
    route: RouteProp<CreateStackParams, T>;
};
