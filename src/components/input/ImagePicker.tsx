import React, { useState, useContext } from 'react';
import styled, { ThemeContext } from 'styled-components/native';
import { TouchableOpacity, Image, Alert } from 'react-native';
// import { checkPhotoLibraryPermission } from '@utils';
// import ImagePicker, { ImagePickerResponse } from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';
import { Icon, Text } from 'react-native-elements';

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

interface Props {
    placeholder: string;
    value?: ImagePicker.ImagePickerResult;
    onChangeImage: (image: ImagePicker.ImagePickerResult | undefined) => void;
}

const ImagePickerComponent = (props: Props) => {
    const themeContext = useContext(ThemeContext);
    const { value } = props;
    // const [imageSource, setImageSource] = useState<ImagePicker.ImagePickerResult>();

    const resetImageSource = () => {
        // setImageSource(undefined);
        props.onChangeImage(undefined);
    };

    const checkPermission = () => {
        ImagePicker.getMediaLibraryPermissionsAsync()
            .then(() => {
                pickImage();
            })
            .catch((err: any) => Alert.alert(err));
    };

    const pickImage = async () => {
        try {
            const result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
                exif: true,
            });

            props.onChangeImage(result);
            // setImageSource(result);
        } catch (err) {
            console.log('image picker err : ', err);
        }
    };

    return (
        <>
            <Container {...props}>
                <Text
                    style={{
                        flex: 1,
                        fontSize: 14,
                        color: value?.uri ? themeContext.color.textBlack : themeContext.color.placeholder,
                    }}
                >
                    {value?.uri ? value.uri.split('/').pop() : props.placeholder}
                </Text>
                <TouchableOpacity
                    onPress={value?.uri ? resetImageSource : checkPermission}
                    style={{
                        width: 27,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: value?.uri ? 'transparent' : themeContext.color.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon
                        color={value?.uri ? themeContext.color.primary : 'white'}
                        name={value?.uri ? 'clear' : 'add'}
                    />
                </TouchableOpacity>
            </Container>
        </>
    );
};

export default ImagePickerComponent;
