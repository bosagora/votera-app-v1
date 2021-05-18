import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type AccessStackParams = {
    Landing: undefined;
    Signup: undefined;
    Login: undefined;
    Recovery: undefined;
};

export type AccessNavProps<T extends keyof AccessStackParams> = {
    navigation: StackNavigationProp<AccessStackParams, T>;
    route: RouteProp<AccessStackParams, T>;
};
