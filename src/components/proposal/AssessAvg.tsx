import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-elements';
import { ThemeContext } from 'styled-components/native';
import { SummarizeResponse } from '~/graphql/generated/generated';
import globalStyle from '~/styles/global';
import getString from '~/utils/locales/STRINGS';

interface AssessAvgProps {
    assessResultData: SummarizeResponse;
}

const AssessAvg = (props: AssessAvgProps) => {
    const { assessResultData } = props;
    const themeContext = useContext(ThemeContext);
    const defaultStyle = { lineHeight: 25 };

    const [avgs, setAvgs] = useState<string[]>(['0', '0', '0', '0', '0']);
    const [nodeCount, setNodeCount] = useState(0);

    useEffect(() => {
        if (assessResultData) {
            let nodeCount = 0;
            setAvgs(
                assessResultData.data.map((d) => {
                    let sum = 0;
                    let sc = 0;
                    Object.keys(d.response).map((key) => {
                        const point = parseInt(key) + 1;
                        const count = d.response[key];

                        sum += point * count;
                        sc += count;
                    });
                    if (nodeCount !== sc) nodeCount = sc;
                    return (sum / sc).toFixed(1);
                }),
            );
            setNodeCount(nodeCount);
        }
    }, [assessResultData]);

    const showTotalAvg = () => {
        let total = 0;
        avgs.map((avg) => (total += Number(avg)));

        if (total === 0) return 0;
        return total / 5;
    };

    return (
        <>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={[globalStyle.gbtext, { fontSize: 37, color: themeContext.color.primary }]}>
                        {showTotalAvg()}
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <Text style={[globalStyle.ltext, { color: themeContext.color.primary }]}>
                            {getString('참여한 노드수')}
                        </Text>
                        <Text style={[globalStyle.mtext, { marginLeft: 5, color: themeContext.color.primary }]}>
                            {nodeCount}
                        </Text>
                    </View>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[globalStyle.ltext, defaultStyle]}>{getString('제안완성도')}</Text>
                        <Text style={globalStyle.mtext}>{avgs[0]}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[globalStyle.ltext, defaultStyle]}>{getString('실현가능성')}</Text>
                        <Text style={globalStyle.mtext}>{avgs[1]}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[globalStyle.ltext, defaultStyle]}>{getString('수익성')}</Text>
                        <Text style={globalStyle.mtext}>{avgs[2]}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[globalStyle.ltext, defaultStyle]}>{getString('매력도')}</Text>
                        <Text style={globalStyle.mtext}>{avgs[3]}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[globalStyle.ltext, defaultStyle]}>{getString('확장가능성')}</Text>
                        <Text style={globalStyle.mtext}>{avgs[4]}</Text>
                    </View>
                </View>
            </View>
        </>
    );
};

export default AssessAvg;
