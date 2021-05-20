import { StyleSheet } from 'react-native';

const globalStyle = StyleSheet.create({
    btext: {
        fontFamily: 'NotoSansCJKkrBold',
        fontWeight: 'bold',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    flexRowAlignCenter: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    flexRowBetween: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontFamily: 'NotoSansCJKkrBold',
        fontWeight: 'bold',
        fontSize: 16,
    },
    hederBottomLine: {
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
    },

    mtext: {
        fontFamily: 'NotoSansCJKkrMedium',
    },
    rtext: {
        fontFamily: 'NotoSansCJKkrRegular',
    },
    ltext: {
        fontFamily: 'NotoSansCJKkrLight',
        fontWeight: '300',
    },
    gmtext: {
        fontFamily: 'GmarketSansTTFMedium',
    },
    gbtext: {
        fontFamily: 'GmarketSansTTFBold',
    },
    rmtext: {
        fontFamily: 'RobotoMedium',
    },
    rltext: {
        fontFamily: 'RobotoLight',
    },
    size10spacing13: {
        color: 'white',
        fontSize: 10,
        letterSpacing: 1.3,
    },
});

export default globalStyle;
