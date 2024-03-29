import React from 'react';
import styled from 'styled-components/native';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';

type Route = {
    key: string;
    name: string;
    params?: object | undefined;
};

const Container = styled.View``;

const TabWrapper = styled.View`
    flex-direction: row;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-horizontal: 22px;
    background-color: white;
`;

const TabButton = styled.TouchableOpacity<{ isFocused: boolean }>`
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 50%;
    border-bottom-width: 2px;
    border-bottom-color: ${(props) => (props.isFocused ? 'rgb(112,58,222)' : 'transparent')};
`;

const TabText = styled.Text<{ isFocused: boolean }>`
    font-weight: 700;
    font-family: 'NotoSansCJKkrBold';
    font-size: 13px;
    color: ${(props) => (props.isFocused ? 'rgb(112,58,222)' : '#000000')};
`;

export default function TabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
    return (
        <Container>
            <TabWrapper>
                {state.routes.map((route: Route, index: number) => {
                    // const {options} = descriptors[route.key];
                    // const label = options.tabBarLabel;
                    const label = route.name;
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };
                    return (
                        <TabButton isFocused={isFocused} onPress={onPress} key={`tab_${index}`}>
                            <TabText isFocused={isFocused}>{label}</TabText>
                        </TabButton>
                    );
                })}
            </TabWrapper>
        </Container>
    );
}
