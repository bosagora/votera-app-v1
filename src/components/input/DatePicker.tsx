import React, { useEffect, useContext } from 'react';
import styled, { ThemeContext } from 'styled-components/native';
import { useSelector } from 'react-redux';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from 'react-native-elements';
import globalStyle from '~/styles/global';
import { DateObject } from 'react-native-calendars';
import getString from '~/utils/locales/STRINGS';
import ActionCreators, { ActionCreatorsState } from '~/state/actions';

const Container = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 52px;
    border-width: 2px;
    border-color: rgb(235, 234, 239);
    border-radius: 5px;
    background-color: rgb(252, 251, 255);
    padding-horizontal: 15px;
`;

export interface Day {
    startDate?: DateObject;
    endDate?: DateObject;
}

interface Props {
    title: string;
    onChange: (date: any) => void;
    isAssess: boolean;
    value: Day;
}

const DatePickerComponent = (props: Props) => {
    const navigation = useNavigation();
    const themeContext = useContext(ThemeContext);
    const selectDatePicker = useSelector((store: ActionCreatorsState) => store.selectDatePicker);

    useEffect(() => {
        calcDate();
    }, [props.value]);

    useEffect(() => {
        if (selectDatePicker && selectDatePicker.startDate && selectDatePicker.endDate) {
            props.onChange({
                startDate: selectDatePicker.startDate,
                endDate: selectDatePicker.endDate
            });
        }
    }, [selectDatePicker]);

    const calcDate = () => {
        if (Object.keys(props.value).length === 0) return getString('날짜를 선택해주세요');
        else if (props.value) {
            return `${props.value.startDate?.year}.${props.value.startDate?.month}.${props.value.startDate?.day} ~ ${props.value.endDate?.year}.${props.value.endDate?.month}.${props.value.endDate?.day}`;
        }
    };

    return (
        <>
            <Container {...props}>
                <Text
                    style={{
                        fontSize: 14,
                        color:
                            Object.keys(props.value).length !== 0
                                ? themeContext.color.textBlack
                                : themeContext.color.placeholder,
                    }}
                >
                    {calcDate()}
                </Text>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate('Calendar', {
                            // returnData: (date: any) => props.onChange(date),
                            isAssess: props.isAssess,
                        })
                    }
                >
                    <Text style={[globalStyle.btext, { color: themeContext.color.primary }]}>
                        {getString('날짜선택')}
                    </Text>
                </TouchableOpacity>
            </Container>
        </>
    );
};

export default DatePickerComponent;
