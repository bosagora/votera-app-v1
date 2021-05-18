import React, { useContext } from 'react';
import { NavigationState, SceneRendererProps, TabBar } from 'react-native-tab-view';
import { ThemeContext } from 'styled-components/native';
import { Text } from 'react-native-elements';
import globalStyle from '~/styles/global';

const TabBarContainer = (
    props: SceneRendererProps & {
        navigationState: NavigationState<{
            key: string;
            title: string;
        }>;
    },
) => {
    const themeContext = useContext(ThemeContext);

    return (
        <TabBar
            {...props}
            tabStyle={{ minHeight: 36 }}
            style={{ backgroundColor: 'white', elevation: 0 }}
            indicatorStyle={{ backgroundColor: themeContext.color.primary }}
            renderLabel={({ route: _route, focused }) => (
                <Text
                    style={[globalStyle.btext, { fontSize: 13, color: focused ? themeContext.color.primary : 'black' }]}
                >
                    {_route.title}
                </Text>
            )}
        />
    );
};

export default TabBarContainer;
