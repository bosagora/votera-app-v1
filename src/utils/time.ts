import moment from 'moment';
import getString from './locales/STRINGS';

export const ddayCalc = (time: number | Date | undefined) => {
    if (time === undefined) return 0;

    const Dday = new Date(time);
    const now = new Date(); // 현재(오늘) 날짜를 받아온다.

    const gap = Dday.getTime() - now.getTime(); // 현재 날짜에서 D-day의 차이를 구한다.

    const day = Math.floor(gap / (1000 * 60 * 60 * 24)) + 1;
    if (day < 0) return '';

    return `D - ${day}`;
};

// 과거
export const sinceCalc = (time: number | Date | string) => {
    if (!time) return '';
    const mTime = moment(time);
    const currentTime = moment();

    const diffTime = {
        day: moment.duration(currentTime.diff(mTime)).days(),
        hour: moment.duration(currentTime.diff(mTime)).hours(),
        minute: moment.duration(currentTime.diff(mTime)).minutes(),
    };

    if (diffTime.day >= 1) {
        return getString('N일 전').replace('N', diffTime.day.toString() || '1');
    }

    if (diffTime.hour >= 1) {
        return getString('N시간 전').replace('N', diffTime.hour.toString() || '1');
    }

    if (diffTime.minute >= 1) {
        return getString('N분 전').replace('N', diffTime.minute.toString() || '1');
    }
    return '1분 전';
};
