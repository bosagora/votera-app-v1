import { DateObject } from 'react-native-calendars';
import types from './types';

interface SelectDatePickerState {
    startDate?: DateObject;
    endDate?: DateObject;
}

interface SelectDatePickerAction {
    type: typeof types.SELECT_DATE_PICKER;
    payload: SelectDatePickerState;
}

const selectDatePicker = (payload: SelectDatePickerState): SelectDatePickerAction => {
    return {
        type: types.SELECT_DATE_PICKER,
        payload,
    };
};

export { selectDatePicker, SelectDatePickerAction, SelectDatePickerState };
