import React, { useContext, useEffect, useState } from 'react';
import { CalendarList, DateObject, LocaleConfig } from 'react-native-calendars';
import { Button, Header, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { CreateNavProps } from '~/navigation/types/CreateStackParams';
import { Image, View } from 'react-native';
import globalStyle from '~/styles/global';
import moment from 'moment';
import _ from 'lodash';
import getString from '~/utils/locales/STRINGS';
import * as Localization from 'expo-localization';

LocaleConfig.locales['ko'] = {
    monthNames: ['일월', '이월', '삼월', '사월', '오월', '유월', '칠월', '팔월', '구월', '시월', '십일월', '십이월'],
    monthNamesShort: ['일', '이', '삼', '사', '오', '육', '칠', '팔', '구', '십', '십일', '십이'],
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

const CalendarScreen = ({ navigation, route }: CreateNavProps<'Calendar'>) => {
    const themeContext = useContext(ThemeContext);
    const [markedDates, setMarkedDates] = useState({});
    const [startDate, setStartDate] = useState<DateObject>();
    const [endDate, setEndDate] = useState<DateObject>();
    const [autoFillDate, setAutoFillDate] = useState();
    const [minDate, setMinDate] = useState<string>();
    const [maxDate, setMaxDate] = useState<string>();
    const [initialDate, setInitialDate] = useState({});

    const start = {
        key: 'start',
        startingDay: true,
        color: themeContext.color.primary,
        textColor: 'white',
    };
    const end = {
        key: 'end',
        endingDay: true,
        color: themeContext.color.primary,
        textColor: 'white',
    };
    const evaluation = {
        color: 'rgb(242,244,250)',
        textColor: themeContext.color.placeholder,
        disabled: true,
    };
    const deliberation = {
        color: 'rgb(235,231,245)',
        textColor: themeContext.color.placeholder,
        disabled: true,
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: getString('투표기간 선택'),
            headerTitleStyle: { ...globalStyle.headerTitle },
            headerLeft: () => (
                <Button
                    onPress={() => navigation.goBack()}
                    icon={<Image source={require('@assets/icons/arrow/backArrowBlack.png')} />}
                    type="clear"
                />
            ),
            headerRight: () => (
                <Button
                    title={getString('완료')}
                    onPress={() => {
                        if (startDate && endDate) {
                            route.params.returnData({ startDate, endDate });
                            navigation.goBack();
                        }
                    }}
                    disabled={!startDate?.timestamp || !endDate?.timestamp}
                    type="clear"
                />
            ),
        });
    }, [navigation, startDate?.timestamp, endDate?.timestamp]);

    const initialize = () => {
        let today = new Date();
        let obj = {};
        let todayString = '';
        let index = 0;
        if (route.params.isAssess) {
            for (let i = 0; i < 7; i++) {
                index = i + 1;
                today = new Date();
                todayString = new Date(today.setDate(today.getDate() + i)).toISOString().slice(0, 10);
                obj[todayString] = { ...evaluation };

                if (i === 0) {
                    obj[todayString].startingDay = true;
                }
                if (i === 6) {
                    obj[todayString].endingDay = true;
                }
            }
        }

        for (let i = index; i < index + 3; i++) {
            today = new Date();
            todayString = new Date(today.setDate(today.getDate() + i)).toISOString().slice(0, 10);
            obj[todayString] = { ...deliberation };
            if (i === index + 0) {
                obj[todayString].startingDay = true;
            }
            if (i === index + 2) {
                obj[todayString].endingDay = true;
            }
        }

        const minDateString = new Date(today.setDate(today.getDate() + 1)).toISOString().slice(0, 10);
        setMinDate(minDateString);
        const maxDateString = new Date(today.setDate(today.getDate() + 13)).toISOString().slice(0, 10);
        setMaxDate(maxDateString);
        // editMaxDate(new Date().getTime(), index + 14);
        setInitialDate(obj);
        setMarkedDates({ ...obj });
    };

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        if (startDate) {
            const today = moment();
            let convertDate = moment(today).add(route.params.isAssess ? 7 : 0, 'd');
            let disableDateStart = moment(startDate.timestamp).add(1, 'd');
            const disableDateEnd = moment(startDate.timestamp).add(3, 'd');
            const maxDateEnd = moment(startDate.timestamp).add(15, 'd');
            // moment(startDate.timestamp).add()

            let deliberationObj = {};
            let deliberationArr = [];

            while (convertDate.valueOf() < startDate.timestamp) {
                deliberationObj[moment(convertDate).format('YYYY-MM-DD')] = deliberation;
                deliberationArr.push(moment(convertDate).format('YYYY-MM-DD'));
                convertDate = moment(convertDate).add(1, 'd');
            }

            const start = deliberationArr.shift();
            const end = deliberationArr.pop();
            deliberationObj[start] = { ...deliberationObj[start], startingDay: true };
            deliberationObj[end] = { ...deliberationObj[end], endingDay: true };

            while (disableDateStart.valueOf() < maxDateEnd.valueOf()) {
                if (disableDateStart.valueOf() < disableDateEnd.valueOf()) {
                    //시작일 후 2일 비활성화
                    deliberationObj[moment(disableDateStart).format('YYYY-MM-DD')] = {
                        disabled: true,
                        disableTouchEvent: true,
                    };
                    // deliberationArr.push(moment(disableDateStart).format('YYYY-MM-DD'));
                } else {
                    deliberationObj[moment(disableDateStart).format('YYYY-MM-DD')] = {};
                }
                disableDateStart = moment(disableDateStart).add(1, 'd');
            }

            setMinDate(moment(convertDate).format('YYYY-MM-DD'));
            setMarkedDates({ ...markedDates, ...deliberationObj });
            // editMaxDate(startDate.timestamp, 13);
        }
    }, [startDate]);

    useEffect(() => {
        if (startDate?.timestamp && endDate?.timestamp) {
            let pivot = moment(startDate.timestamp).add(1, 'd');
            let newAutoFillDate = {};
            while (pivot.valueOf() < endDate.timestamp) {
                newAutoFillDate[moment(pivot).format('YYYY-MM-DD')] = {
                    color: themeContext.color.primary,
                    textColor: 'white',
                    disableTouchEvent: true,
                };
                pivot = moment(pivot).add(1, 'd');
            }
            setMarkedDates({ ...markedDates, ...newAutoFillDate });
            setAutoFillDate(newAutoFillDate);
        } else {
            if (!_.isEmpty(markedDates)) {
                const newMarkedDates = { ...markedDates };
                if (!_.isEmpty(autoFillDate)) {
                    Object.keys(autoFillDate).forEach((afd) => {
                        delete newMarkedDates[afd];
                    });
                    if (!startDate) return;
                    let disableDateStart = moment(startDate.timestamp).add(1, 'd');
                    const disableDateEnd = moment(startDate.timestamp).add(3, 'd');
                    let deliberationObj = {};

                    while (disableDateStart.valueOf() < disableDateEnd.valueOf()) {
                        //시작일 후 2일 비활성화
                        deliberationObj[moment(disableDateStart).format('YYYY-MM-DD')] = {
                            disabled: true,
                            disableTouchEvent: true,
                        };

                        disableDateStart = moment(disableDateStart).add(1, 'd');
                    }

                    setMarkedDates({ ...newMarkedDates, ...deliberationObj });
                    setAutoFillDate(undefined);
                }
            }
        }
    }, [startDate, endDate]);

    const editMaxDate = (timestamp: number, distance: number) => {
        const max = new Date(timestamp);
        // console.log('change max : ', new Date(max.setDate(max.getDate() + distance)).toISOString().slice(0, 10));
        setMaxDate(new Date(max.setDate(max.getDate() + distance)).toISOString().slice(0, 10));
    };

    const resetDate = (key: string, to?: DateObject) => {
        let newMarkedDates = { ...markedDates };
        Object.keys(newMarkedDates).forEach((keyDate) => {
            if (newMarkedDates[keyDate].key === key) {
                if (to && keyDate !== to?.dateString) {
                    console.log(' keyDate !== to?.dateString ');
                    Object.defineProperty(
                        newMarkedDates,
                        to?.dateString,
                        Object.getOwnPropertyDescriptor(newMarkedDates, keyDate),
                    );
                }
                delete newMarkedDates[keyDate];
            }
        });

        setMarkedDates(newMarkedDates);
    };

    const onPressDay = (day: DateObject) => {
        if (!startDate) {
            //맨 처음 눌렀을때
            setStartDate(day);
            setMarkedDates({
                ...markedDates,
                [day.dateString]: start,
            });
            editMaxDate(day.timestamp, 14);
        } else if (endDate && endDate.timestamp === day.timestamp) {
            resetDate('end');
            setEndDate(undefined);
            editMaxDate(startDate.timestamp, 14);
        } else if (endDate && endDate.timestamp !== day.timestamp && startDate.timestamp !== day.timestamp) {
            resetDate('end', day);
            setEndDate(day);
            // editMaxDate(day.timestamp, 0);
            // setMarkedDates({
            //     ...markedDates,
            //     [day.dateString]: end,
            // });
        } else {
            if (startDate.timestamp === day.timestamp) {
                setStartDate(undefined);
                setEndDate(undefined);
                initialize();
            } else if (startDate.timestamp > day.timestamp) {
                setStartDate(day);
                setMarkedDates({
                    ...initialDate,
                    [day.dateString]: start,
                });
            } else if (startDate.timestamp === day.timestamp && !endDate) {
                setStartDate(undefined);
                setEndDate(undefined);
                editMaxDate(new Date().getTime(), 21);
                setMarkedDates({ ...initialDate });
            } else if (!endDate && startDate.timestamp !== day.timestamp) {
                setEndDate(day);
                // editMaxDate(day.timestamp, 0);
                setMarkedDates({
                    ...markedDates,
                    [day.dateString]: end,
                });
            }
        }
    };

    if (!minDate || !maxDate) return null;
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View
                style={{
                    paddingVertical: 30,
                    paddingHorizontal: 22,
                }}
            >
                <Text style={[globalStyle.rtext, { fontSize: 14, lineHeight: 23 }]}>
                    {getString(
                        '투표를 위한 시작일과 종료일을 아래에서 선택해주세요&#46; 제안 등록일 포함 7일 동안 사전 평가가 진행되며, 사전평가 시점 3일 후, 14일 이내 투표를 시작할 수 있습니다&#46;',
                    )}
                    {'\n'}
                    <Text style={{ color: themeContext.color.primary }}>
                        {getString('투표 기간은 최소 3일에서 최대 14일까지 등록 가능합니다&#46;')}
                    </Text>
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <CalendarList
                    pastScrollRange={0}
                    futureScrollRange={1}
                    markedDates={markedDates}
                    calendarHeight={400}
                    monthFormat={'M'}
                    minDate={minDate}
                    maxDate={maxDate}
                    markingType={'period'}
                    onDayPress={(day) => onPressDay(day)}
                    theme={{
                        'stylesheet.calendar.header': {
                            monthText: {
                                fontSize: 56,
                                fontFamily: 'GmarketSansTTFBold',
                                color: themeContext.color.primary,
                            },
                        },
                        textDayFontFamily: 'RobotoRegular',
                        textDayFontSize: 14,
                        textDayStyle: {
                            fontFamily: 'RobotoRegular',
                            fontSize: 14,
                            color: themeContext.color.textBlack,
                        },
                        textSectionTitleColor: themeContext.color.textBlack,
                    }}
                />
            </View>
        </View>
    );
};

export default CalendarScreen;
