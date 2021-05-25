import React, { useContext, useState } from 'react';
import { ThemeContext } from 'styled-components/native';
import { Icon, Text } from 'react-native-elements';
import TextInputComponent from '~/components/input/SingleLineInput2';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';


interface NodeNameScreenProps {
    validator: string;
    onComplete: (nodeName: string) => void;
}

const NodeNameScreen = (props: NodeNameScreenProps) => {
    const { validator } = props;
    const themeContext = useContext(ThemeContext);
    const [nodeName, setNodeName] = useState('');
    const [inputTimer, setInputTimer] = useState<NodeJS.Timeout>();

    const checkNodeName = (text: string) => {
        if (inputTimer) {
            clearTimeout(inputTimer);
        }
        setNodeName(text);

        setInputTimer(
            setTimeout(() => {
                if (text.length) props.onComplete(text);
                else props.onComplete('');
                //name 중복 체크 로직
                setInputTimer(undefined);
            }, 300),
        );
    };

    return (
        <>
            <Text style={[globalStyle.btext, { color: 'black' }]}>{getString('인증된 노드 주소')}</Text>
            <Text style={[globalStyle.gmtext, { fontSize: 12, lineHeight: 20, marginTop: 17 }]}>{`${validator}`}</Text>
            <Text
                style={{ lineHeight: 23, marginTop: 40 }}
            >{getString(`노드의 닉네임을 입력해주세요!\n추후 내 설정에서 언제든 변경할 수 있습니다&#46;`)}</Text>
            <TextInputComponent
                style={{ marginTop: 32 }}
                inputStyle={{ color: themeContext.color.primary }}
                value={nodeName}
                onChangeText={checkNodeName}
                subComponent={
                    nodeName.length ? (
                        <Icon
                            onPress={() => setNodeName('')}
                            name="cancel"
                            color={themeContext.color.primary}
                            size={28}
                        />
                    ) : null
                }
                placeholderText={getString('노드 닉네임을 입력해주세요')}
            />
        </>
    );
};

export default NodeNameScreen;
