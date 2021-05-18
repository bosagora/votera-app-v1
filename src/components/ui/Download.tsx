import React, { useContext } from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { Icon, Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';

interface DownloadProps {
    label: string;
    onPress: () => void;
}

const DownloadComponent: React.FC<DownloadProps> = (props) => {
    const themeContext = useContext(ThemeContext);
    return (
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={props.onPress}>
            {/* <Image source={require('@assets/images/icons/download.png')} /> */}
            <Icon name="file-download" color={themeContext.color.primary} />
            <Text style={{ marginLeft: 10, color: themeContext.color.primary, lineHeight: 26 }}>{props.label}</Text>
        </TouchableOpacity>
    );
};
export default DownloadComponent;
