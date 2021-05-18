import React from 'react';
import { Image } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { CommonNavProps } from '~/navigation/common/CommonStack';

const WebViewScreen = ({ route, navigation }: CommonNavProps<'WebView'>) => {

    React.useLayoutEffect(() => {
        console.log('WebView layoutEffect');
        navigation.setOptions({
            headerTitle: route.params.title,
            headerLeft: () => (
                <Button
                    onPress={() => {
                        navigation.pop();
                    }}
                    icon={<Image source={require('@assets/icons/arrow/backArrowBlack.png')} />}
                    type="clear"
                />
            ),
            headerStyle: { shadowOffset: { height: 0, width: 0 }, elevation: 0 },
        });
    }, [navigation, route.params]);
    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <WebView source={{ uri: route.params.uri }} />
        </SafeAreaView>
    );
};

export default WebViewScreen;
