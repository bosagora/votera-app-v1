import React, { useContext, useState, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { ThemeContext } from 'styled-components/native';
import { Icon, Text } from 'react-native-elements';
import { debounce } from 'lodash';
import TextInputComponent from '~/components/input/SingleLineInput2';
import { useCheckUsernameLazyQuery } from '~/graphql/generated/generated';
import getString from '~/utils/locales/STRINGS';

const DEBOUNCER_TIME = 300;
interface NameScreenProps {
    onComplete: (accountName: string, incomplete?: boolean) => void;
}

const NameScreen = (props: NameScreenProps) => {
    const themeContext = useContext(ThemeContext);
    const [accountName, setAccountName] = useState('');
    const [nameError, setNameError] = useState(false);
    const [checkUsername, { loading }] = useCheckUsernameLazyQuery({
        fetchPolicy: 'no-cache',
        onCompleted: (data) => {
            if (!data.checkDupUserName) {
                setNameError(true);
                props.onComplete(accountName, true);
            } else {
                if (data.checkDupUserName.duplicated) {
                    setNameError(true);
                    props.onComplete(data.checkDupUserName.username || '', true);
                } else {
                    setNameError(false);
                    props.onComplete(data.checkDupUserName.username || '', false);
                }
            }
        },
        onError: (err) => {
            setNameError(true);
            props.onComplete(accountName, true);
        },
    });

    const debounceNameCheck = useCallback(
        debounce((username: string) => {
            if (username.length > 0) {
                checkUsername({
                    variables: {
                        username,
                    },
                });
            } else {
                props.onComplete('', true);
            }
        }, DEBOUNCER_TIME),
        [],
    );

    const checkAccountName = (text: string) => {
        setAccountName(text);
        setNameError(false);
        debounceNameCheck(text);
    };

    return (
        <>
            <Text style={{ lineHeight: 23, marginTop: 40 }}>
                {getString(`계정명을 입력해주세요!\n계정명은 언제든지 변경할 수 있습니다&#46;`)}
            </Text>
            <TextInputComponent
                style={{ marginTop: 32 }}
                inputStyle={{ color: themeContext.color.primary }}
                value={accountName}
                onChangeText={checkAccountName}
                subComponent={
                    accountName.length ? (
                        <Icon
                            onPress={() => setAccountName('')}
                            name="cancel"
                            color={themeContext.color.primary}
                            size={28}
                        />
                    ) : null
                }
                placeholderText={getString('계정명을 입력해주세요')}
            />
            {nameError && (
                <Text style={{ color: themeContext.color.error, textAlign: 'center', lineHeight: 23, marginTop: 20 }}>
                    {getString('중복된 아이디입니다&#46; 다른 아이디를 입력해주십시오&#46;')}
                </Text>
            )}
            {loading && <ActivityIndicator size="large" />}
        </>
    );
};

export default NameScreen;
