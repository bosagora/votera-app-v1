import React, { useRef } from 'react';
import { View, TouchableOpacity, BackHandler } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import BottomSheet from 'reanimated-bottom-sheet';
import ActionCreators, { ActionCreatorsState } from '../../../state/actions';

const BottomSheetComponent = (): JSX.Element | null => {
    const dispatch = useDispatch();
    const sheetRef = useRef<BottomSheet>(null);
    const bottomSheet = useSelector((store: ActionCreatorsState) => store.bottomSheetState);

    React.useEffect(() => {
        if (bottomSheet.visibility) {
            const backAction = () => {
                dispatch(ActionCreators.bottomSheetAction({ visibility: false }));
                return true;
            };
            sheetRef?.current?.snapTo(0);
            const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
            return () => backHandler.remove();
        }
        return () => {
            // console.log('no-op');
        };
    }, [bottomSheet.visibility]);

    if (!bottomSheet.visibility) return null;

    return (
        <>
            {bottomSheet.visibility && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                        sheetRef?.current?.snapTo(1);
                    }}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.25)',
                    }}
                />
            )}
            <BottomSheet
                onCloseEnd={() => dispatch(ActionCreators.bottomSheetAction({ visibility: false }))}
                ref={sheetRef}
                snapPoints={[bottomSheet.sheetHeight || 0, 0]}
                renderContent={bottomSheet.bodyComponent}
                initialSnap={1}
                renderHeader={() => (
                    <View
                        style={{
                            height: 24,
                            backgroundColor: 'white',
                            borderTopLeftRadius: 5,
                            borderTopRightRadius: 5,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <View style={{ width: 33, height: 4, borderRadius: 2, backgroundColor: '#EDEDED' }} />
                    </View>
                )}
            />
        </>
    );
};

export default BottomSheetComponent;
