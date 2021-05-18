const nodeLibs = require('node-libs-react-native');

module.exports = {
    transformer: {
        assetPlugins: ['expo-asset/tools/hashAssetFiles'],
    },
    resolver: {
        extraNodeModules: nodeLibs,
    },
};
