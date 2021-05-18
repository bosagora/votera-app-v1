import React, { useEffect, useState, useContext } from 'react';
import { BarCodeScanner, BarCodeEvent, BarCodeBounds } from 'expo-barcode-scanner';
import { View, Alert, Modal, LayoutRectangle, Platform, Linking, NativeModules } from 'react-native';
import { Button, Icon, Header, Text } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import * as Device from 'expo-device';
import { ThemeContext } from 'styled-components/native';
import LoadingModalScreen from '~/components/shared/LoadingModal/screen';
import ActionCreators, { ActionCreatorsState } from '~/state/actions';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';

interface QRCodeLoadingProps {
    show: boolean;
    onComplete: (encrypted: string) => void;
    onDismiss: (isError: boolean) => void;
}

const QRCodeLoading = (props: QRCodeLoadingProps): JSX.Element | null => {
    const { show } = props;

    useEffect(() => {
        const id = setTimeout(() => {
            Alert.alert('Loading failed');
            props.onDismiss(true);
        }, 5000);

        return () => {
            clearTimeout(id);
        };
    }, []);

    if (!show) {
        return null;
    }
    return <LoadingModalScreen />;
};

const QRCodeScanner = (): JSX.Element => {
    const { RNAndroidOpenSettings } = NativeModules;
    const qrcodeScanner = useSelector((store: ActionCreatorsState) => store.qrcodeScanner);
    const dispatch = useDispatch();
    const themeContext = useContext(ThemeContext);
    const [hasPermission, setHasPermission] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [bounds, setBounds] = useState<BarCodeBounds>();
    const [layout, setLayout] = useState<LayoutRectangle>();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })().catch((error) => {
            console.log('requestPermissions error = ', error);
            Alert.alert('failed to start scanner');
        });
    }, []);

    useEffect(() => {
        if (!qrcodeScanner.visibility) {
            setScanned(false);
        }
    }, [qrcodeScanner.visibility]);

    const renderQrcodeMarker = (): JSX.Element | null => {
        if (!scanned) {
            return null;
        }

        return (
            <View
                style={{
                    borderWidth: 2,
                    borderColor: '#FFFF00',
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    left: bounds?.origin.x,
                    top: bounds?.origin.y,
                    width: bounds?.size.width,
                    height: bounds?.size.height,
                }}
            />
        );
    };

    const handleBarCodeScanned = (params: BarCodeEvent) => {
        const bounds = params.bounds;
        if (bounds && layout) {
            bounds.origin.x += layout.x;
            bounds.origin.y += layout.y;
        }
        setBounds(bounds);
        setScanned(true);

        const id = setTimeout(() => {
            if (qrcodeScanner.onComplete) qrcodeScanner.onComplete(params.data);
        }, 200);
        return () => {
            clearTimeout(id);
        };
    };

    if (hasPermission === null) {
        // eslint-disable-next-line react-native/no-raw-text
        return <Text>Requesting for camera permission</Text>;
    }

    if (!qrcodeScanner.visibility) return <></>;

    if (hasPermission === false) {
        Alert.alert(
            getString('카메라 접근 권한이 필요합니다&#46;'),
            getString('이동을 누르면 앱 설정으로 이동합니다&#46;'),
            [
                {
                    text: getString('취소'),
                    onPress: () => {
                        console.log('cancel pressed');
                    },
                    style: 'cancel',
                },
                {
                    text: getString('이동'),
                    onPress: () => {
                        if (Platform.OS === 'ios') {
                            Linking.openURL('app-settings:');
                        } else {
                            RNAndroidOpenSettings.appDetailsSettings();
                        }
                    },
                },
            ],
        );

        return <></>;
    }

    if (Device.isDevice) {
        // REAL DEVICE
        return (
            <Modal animationType="slide">
                <Header
                    centerComponent={
                        <Text style={[globalStyle.headerTitle]}>
                            {qrcodeScanner.action === ActionCreators.QRCodeActionType.Vote
                                ? getString(`투표 인증하기`)
                                : getString(`노드 인증하기`)}
                        </Text>
                    }
                    leftComponent={
                        <Button
                            onPress={() => {
                                dispatch(ActionCreators.qrcodeScanner({ visibility: false }));
                                if (qrcodeScanner.onCancel) qrcodeScanner.onCancel();
                            }}
                            icon={<Icon size={30} name="clear" />}
                            type="clear"
                        />
                    }
                    containerStyle={[{ backgroundColor: 'white', borderBottomWidth: 0 }]}
                />

                <View style={{ flex: 1, backgroundColor: 'white', padding: 20, marginBottom: 20 }}>
                    <View style={{ paddingBottom: 50 }}>
                        <Text style={globalStyle.btext}>{getString('인증 방법')}</Text>
                        <Text style={{ lineHeight: 23 }}>
                            {qrcodeScanner.action === ActionCreators.QRCodeActionType.Vote
                                ? getString(
                                      `PC 노드 화면 > Congress 투표 화면의 QR코드를\n아래 화면에 비추면 자동으로 인증됩니다&#46;`,
                                  )
                                : getString(
                                      `PC 노드 화면 > Congress 인증 화면의 QR코드를\n아래 화면에 비추면 자동으로 인증됩니다&#46;`,
                                  )}
                        </Text>
                    </View>
                    <BarCodeScanner
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                        style={{ height: 382 }}
                        onLayout={(event) => {
                            setLayout(event.nativeEvent.layout);
                        }}
                    />
                    {renderQrcodeMarker()}
                    {loading && (
                        <QRCodeLoading
                            show={loading}
                            onDismiss={(isError: boolean) => {
                                setLoading(false);
                            }}
                            onComplete={(encrypted: string) => {
                                setLoading(false);
                            }}
                        />
                    )}
                </View>
            </Modal>
        );
    }

    return (
        <>
            <Modal visible={qrcodeScanner.visibility} animationType="slide">
                {/* <View style={{ flex: 1, backgroundColor: 'white' }}> */}
                <Header
                    centerComponent={<Text style={[globalStyle.headerTitle]}>{getString('계정 만들기')}</Text>}
                    leftComponent={
                        <Button
                            onPress={() => dispatch(ActionCreators.qrcodeScanner({ visibility: false }))}
                            icon={<Icon size={30} name="clear" color={themeContext.color.primary} />}
                            type="clear"
                        />
                    }
                    containerStyle={[{ backgroundColor: 'white' }]}
                />
            </Modal>
        </>
    );
};

export default QRCodeScanner;
