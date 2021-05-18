import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type CommonStackParams = {
    WebView: {
        title: string;
        uri: string;
    }
};

export type CommonNavProps<T extends keyof CommonStackParams> = {
    navigation: StackNavigationProp<CommonStackParams, T>;
    route: RouteProp<CommonStackParams, T>;
};
