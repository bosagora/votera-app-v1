/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-elements';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import ActionCreators from '~/state/actions';
import globalStyle from '~/styles/global';

import { FeedFilterType, OpinionFilterType, ProposalFilterType, TestFilterType } from '~/types/filterType';
import getString from '~/utils/locales/STRINGS';

/**
 * ! Filter Button 컴포넌트 사용방법
 * * 1. src/types/filterType 내 사용하고자 하는 Filter목록을 Enum 타입으로 정의
 * * 2. UNION_* Field에 새로 생성한 Type을 추가합니다.
 * * 3. FilterButton에는 세가지 Props가 필요합니다.
 * * * 1) filterType : 이페이지에서 사용될 필터Type (src/types/filterType 내 정의)
 * * * 2) currentFilter : 현재 스크린에서 선택된 필터 타입 스크린 내 filter state value
 * * * 3) setFilter : 현재 스크린내 useState의 filter setter 함수 사용
 * * * * ex> [filter, setFilter] = useState<FilterType>(FilterType.defaultFilter);
 *  <FilterButton
 *      filterType={ProposalFilterType}
 *      currentFilter={currentFilter}
 *      setFilter={setFilter}
 *  />
 */

type UNION_FILTER_TYPEOF = typeof ProposalFilterType | typeof FeedFilterType | typeof OpinionFilterType;
type UNION_FILTER_BUTTON_TYPE = ProposalFilterType | FeedFilterType | OpinionFilterType;
type UNION_SET_FILTER_TYPE =
    | React.Dispatch<React.SetStateAction<ProposalFilterType>>
    | React.Dispatch<React.SetStateAction<FeedFilterType>>
    | React.Dispatch<React.SetStateAction<OpinionFilterType>>;

interface FilterButtonProps {
    filterType: UNION_FILTER_TYPEOF;
    currentFilter: UNION_FILTER_BUTTON_TYPE;
    setFilter: UNION_SET_FILTER_TYPE;
}

const styles = StyleSheet.create({});

const FilterButton = (props: FilterButtonProps): any => {
    const { filterType, currentFilter, setFilter } = props;
    const dispatch = useDispatch();
    const [filterOnComponent, setFilterOnComponent] = useState<UNION_FILTER_BUTTON_TYPE>();

    function renderFilterCard({ item }) {
        return (
            <TouchableOpacity
                style={{ height: 30 }}
                onPressIn={() => {
                    setFilter(item);
                    setFilterOnComponent(item);
                    dispatch(ActionCreators.bottomSheetAction({ visibility: false }));
                }}
            >
                <Text>{getString(item)}</Text>
            </TouchableOpacity>
        );
    }
    function renderBottomSheetBodyComponent() {
        return (
            <View style={{ backgroundColor: 'white' }}>
                <FlatList
                    keyExtractor={(item, index) => `filter_${index}`}
                    data={Object.values(filterType)}
                    renderItem={renderFilterCard}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingHorizontal: 22, height: 200 }}
                />
            </View>
        );
    }

    useEffect(() => {
        if (currentFilter) {
            setFilterOnComponent(currentFilter);
        }
    }, [currentFilter]);

    return (
        <TouchableOpacity
            onPress={() => {
                console.log('Click Filter Tap');
                dispatch(
                    ActionCreators.bottomSheetAction({
                        visibility: true,
                        bodyComponent: () => renderBottomSheetBodyComponent(),
                        sheetHeight: Object.values(filterType).length * 70,
                    }),
                );
            }}
        >
            <View style={globalStyle.flexRowBetween}>
                <Text style={{ fontSize: 13 }}>{getString(filterOnComponent as string)}</Text>
                <Image style={{ marginLeft: 12 }} source={require('@assets/icons/arrow/downArrowDarkgray.png')} />
            </View>
        </TouchableOpacity>
    );
};

export default FilterButton;
