import React, { useContext, useEffect, useState } from 'react';
import { View, Image, ScrollView } from 'react-native';
import { Button, Icon, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { MainNavProps } from '~/navigation/types/MainStackParams';
import globalStyle from '~/styles/global';
import SearchInput from '~/components/input/SingleLineInput2';
import { Proposal, useGetProposalsLazyQuery } from '~/graphql/generated/generated';
import ProposalCard from '~/components/proposal/ProposalCard';
import LocalStorage from '~/utils/LocalStorage';
import FocusAwareStatusBar from '~/components/statusbar/FocusAwareStatusBar';
import { ProposalContext } from '~/contexts/ProposalContext';
import getString from '~/utils/locales/STRINGS';

const Search = ({ navigation, route }: MainNavProps<'Search'>): JSX.Element => {
    const themeContext = useContext(ThemeContext);
    const [searchValue, setSearchValue] = useState<string>('');
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [getProposals, { data: proposalsResponse }] = useGetProposalsLazyQuery({ fetchPolicy: 'no-cache' });
    const [isSearched, setIsSearched] = useState<boolean>(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const { fetchProposal } = useContext(ProposalContext);

    useEffect(() => {
        LocalStorage.get().then((localData) => {
            const searchHistory = localData.searchHistory || [];
            setSearchHistory(searchHistory);
        });
    }, []);

    useEffect(() => {
        if (proposalsResponse?.proposals) {
            setProposals(proposalsResponse?.proposals as Proposal[]);
            const currentHistory = [...searchHistory];

            const foundHistoryIdx = currentHistory.findIndex((history) => history === searchValue);
            if (foundHistoryIdx > -1) {
                currentHistory.splice(foundHistoryIdx, 1);
            }
            let addedHistory: string[];
            const valueLength = searchValue.length;
            const splitChar = Array.from(searchValue);
            const isNotEmptyStr = splitChar.some((char) => char !== ' ');

            if (valueLength > 0 && isNotEmptyStr) {
                addedHistory = [searchValue, ...currentHistory];
            } else {
                addedHistory = [...currentHistory];
            }
            LocalStorage.get().then((localData) => {
                if (addedHistory.length > 10) {
                    addedHistory.pop();
                }
                localData.searchHistory = addedHistory;
                LocalStorage.set(localData);
            });
            setSearchHistory(addedHistory);
        }
    }, [proposalsResponse]);

    function renderProposals({ item }: { item: Proposal }) {
        // FIXME: group에 deadline 프로퍼티 추가 해야함
        const { name, description, status, type, assessPeriod, votePeriod, proposalId } = item;
        if (!proposalId) return null;

        return (
            <ProposalCard
                title={name}
                description={description || ''}
                type={type}
                status={status}
                assessPeriod={assessPeriod!}
                votePeriod={votePeriod!}
                onPress={() => {
                    fetchProposal(proposalId);
                    navigation.navigate('ProposalDetail', { id: proposalId });
                }}
            />
        );
    }
    function renderHistoryComponent() {
        return (
            <View style={{ paddingHorizontal: 23, paddingTop: 30, flexDirection: 'column' }}>
                <Text style={{ color: 'rgb(232, 111, 222)', fontSize: 11 }}>{getString('최근검색어')}</Text>
                <FlatList
                    keyExtractor={(item, index) => 'searchHistory_' + index}
                    scrollEnabled={false}
                    extraData={searchHistory}
                    data={searchHistory}
                    renderItem={({ index, item }) => {
                        return (
                            <View
                                style={[
                                    globalStyle.flexRowBetween,
                                    {
                                        paddingTop: 10,
                                    },
                                ]}
                            >
                                <Button
                                    title={item}
                                    buttonStyle={{ justifyContent: 'flex-start' }}
                                    containerStyle={{ flex: 1 }}
                                    onPress={() => {
                                        setSearchValue(item);
                                        runSearch(item);
                                    }}
                                    useForeground={true}
                                    type="clear"
                                />
                                <Button
                                    icon={<Image source={require('@assets/icons/drawer/closeIconLightgray.png')} />}
                                    onPress={() => {
                                        const currentHistory = [...searchHistory];
                                        LocalStorage.get().then((localData) => {
                                            currentHistory.splice(index, 1);
                                            localData.searchHistory = currentHistory;
                                            LocalStorage.set(localData);
                                            setSearchHistory(currentHistory);
                                        });
                                    }}
                                    type="clear"
                                />
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={require('@assets/icons/search/searchGrayIcon.png')} />
                            <Text style={{ fontSize: 13, color: themeContext.color.disabled, marginLeft: 6 }}>
                                검색 내역이 없습니다
                            </Text>
                        </View>
                    }
                />
            </View>
        );
    }
    function renderSearchedComponent() {
        return (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 23, paddingBottom: 160 }}>
                <View style={{ paddingTop: 30, flexDirection: 'row' }}>
                    <Text>'{searchValue}'검색 결과 </Text>
                    <Text style={{ color: themeContext.color.primary, paddingLeft: 19 }}>{proposals.length}개</Text>
                </View>
                <View>
                    {proposals && (
                        <FlatList
                            keyExtractor={(item, index) => 'proposal_' + index}
                            style={{ backgroundColor: 'white' }}
                            data={proposals || []}
                            renderItem={renderProposals}
                            ListEmptyComponent={
                                <View
                                    style={[
                                        globalStyle.flexRowBetween,
                                        {
                                            paddingTop: 30,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        },
                                    ]}
                                >
                                    <Image source={require('@assets/icons/search/searchGrayIcon.png')} />
                                    <Text style={{ color: 'rgb(182, 175, 198)', paddingLeft: 6 }}>
                                        {getString('검색 결과가 없습니다&#46;')}
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </ScrollView>
        );
    }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerTitleAlign: 'center',
            headerTitle: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={globalStyle.headerTitle}>{getString('검색')} </Text>
                </View>
            ),
            headerLeft: () => (
                <Button
                    onPress={() => navigation.pop()}
                    icon={<Image source={require('@assets/icons/arrow/backArrowBlack.png')} />}
                    type="clear"
                />
            ),
        });
    });

    const runSearch = (keyword?: string) => {
        if ((searchValue.length > 0 && searchValue !== null && searchValue !== undefined) || keyword) {
            getProposals({
                variables: {
                    where: {
                        name_contains: keyword || searchValue,
                    },
                },
            });
            setIsSearched(true);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="white" />
            <View style={{ paddingHorizontal: 23, paddingTop: 30 }}>
                <SearchInput
                    onChangeText={(text) => {
                        setSearchValue(text);
                        setIsSearched(false);
                        setProposals([]);
                    }}
                    searchValue={searchValue}
                    value={searchValue}
                    koreanInput
                    subComponent={
                        searchValue.length > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }} onPress={runSearch}>
                                    <Image source={require('@assets/icons/search/searchIconPurple.png')} />
                                </TouchableOpacity>
                                <Icon
                                    onPress={() => {
                                        setSearchValue('');
                                        setIsSearched(false);
                                        setProposals([]);
                                    }}
                                    name="cancel"
                                    color={themeContext.color.primary}
                                    size={28}
                                />
                            </View>
                        )
                    }
                    onSubmitEditing={runSearch}
                    placeholderText={getString('검색어를 입력해주세요')}
                />
            </View>
            {!isSearched && renderHistoryComponent()}
            {isSearched && renderSearchedComponent()}
        </View>
    );
};

export default Search;
