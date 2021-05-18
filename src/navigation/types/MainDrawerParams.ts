import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';

export type MainDrawerParams = {
    Main: undefined;
    CreateScreens: undefined;
    ConvertNode: undefined;
    AddNode: undefined;
    ChangePin: undefined;
    AccountInfo: undefined;
};

export type MainDrawerProps<T extends keyof MainDrawerParams> = {
    navigation: DrawerNavigationProp<MainDrawerParams, T>;
    route: RouteProp<MainDrawerParams, T>;
};
