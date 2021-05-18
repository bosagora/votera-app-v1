import Share from 'react-native-share';

export const downloadFile = async (fileUrl?: string, fileName?: string) => {
    if (!fileUrl) return;
    return await Share.open({
        url: fileUrl,
        message: 'Votera share',
        title: fileName || 'Votera',
    });
};
