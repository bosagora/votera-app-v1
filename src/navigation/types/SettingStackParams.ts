import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type SettingStackParams = {
    Settings: undefined;
    AccountInfo: undefined;
    ConvertNode: undefined;
    AddNode: undefined;
    ChangePin: undefined;
    Alarm: undefined
};

export type SettingNavProps<T extends keyof SettingStackParams> = {
    navigation: StackNavigationProp<SettingStackParams, T>;
    route: RouteProp<SettingStackParams, T>;
};
