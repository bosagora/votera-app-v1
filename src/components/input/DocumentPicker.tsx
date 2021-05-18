import React, { useState, useEffect, useContext } from 'react';
import styled, { ThemeContext } from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Button, Icon, Text } from 'react-native-elements';

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
    margin-bottom: 7px;
`;

interface Props {
    data: DocumentPicker.DocumentResult;
    placeholder: string;
    addFile: (fileData: DocumentPicker.DocumentResult) => void;
    removeFile: (fileData: DocumentPicker.DocumentResult) => void;
}

interface PickerProps {
    placeholder: string;
    onChangeFiles: (files: DocumentPicker.DocumentResult[]) => void;
    value?: DocumentPicker.DocumentResult[];
}

const DocumentPickerComponent = (props: Props) => {
    const themeContext = useContext(ThemeContext);
    const [fileSource, setFileSource] = useState<DocumentPicker.DocumentResult>();

    useEffect(() => {
        setFileSource({ ...props.data });
    }, [props.data]);

    const resetFileSource = () => {
        if (fileSource) {
            props.removeFile(fileSource);
        }
        setFileSource({ type: 'cancel' });
    };

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
            });
            props.addFile(result);
        } catch (err) {
            console.log('Document Picker error : ', err);
        }
    };

    return (
        <>
            <Container {...props}>
                <Text
                    style={{
                        flex: 1,
                        fontSize: 15,
                        color: fileSource?.type === 'success' ? themeContext.color.textBlack : themeContext.color.placeholder,
                    }}
                >
                    {fileSource?.type === 'success' ? fileSource.name : props.placeholder}
                </Text>

                <TouchableOpacity
                    onPress={fileSource?.type === 'success' ? resetFileSource : pickFile}
                    style={{
                        width: 27,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: fileSource?.type === 'success' ? 'transparent' : themeContext.color.primary,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Icon
                        color={fileSource?.type === 'success' ? themeContext.color.primary : 'white'}
                        name={fileSource?.type === 'success' ? 'clear' : 'add'}
                    />
                </TouchableOpacity>
            </Container>
        </>
    );
};

const DocumentPickerWrapper = (props: PickerProps) => {
    const { value } = props;

    const addFile = (fileData: DocumentPicker.DocumentResult) => {
        if (fileData.type !== 'success') {
            return;
        }

        const filteredFiles = value?.filter((file) => file.type === 'success') || [];
        const newFiles = [...filteredFiles, fileData];
        // setFiles(newFiles);
        props.onChangeFiles(newFiles);
    };

    const removeFile = (fileData: DocumentPicker.DocumentResult) => {
        if (fileData.type === 'cancel') {
            return;
        }

        const filteredFiles = value?.filter((file) => file.type === 'success' && file.name !== fileData.name && file.uri !== fileData.uri);
        if (!filteredFiles) {
            props.onChangeFiles([{type: 'cancel'}]);
            return;
        }
        props.onChangeFiles(filteredFiles);
        // setFiles(filteredFiles);
    };

    return (
        <>
            {value?.map((file, index) => {
                return (
                    <DocumentPickerComponent
                        key={'attachment_' + index}
                        data={file}
                        addFile={(fileDatas) => addFile(fileDatas)}
                        removeFile={(fileData) => removeFile(fileData)}
                        placeholder={props.placeholder}
                    />
                );
            })}
            {(!value || value.length < 5) && (
                <DocumentPickerComponent
                    key={'attachment_' + (value?.length || 0)}
                    data={{ type: 'cancel' }}
                    addFile={(fileDatas) => addFile(fileDatas)}
                    removeFile={(fileData) => removeFile(fileData)}
                    placeholder={props.placeholder}
                />
            )}
        </>
    );
};

export default DocumentPickerWrapper;
