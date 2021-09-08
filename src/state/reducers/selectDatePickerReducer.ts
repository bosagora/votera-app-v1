import types from '../actions/types';
import { SelectDatePickerAction, SelectDatePickerState } from '../actions/selectDatePicker';

const initialState: SelectDatePickerState = {
};

const SelectDatePickerReducer = (state: SelectDatePickerState = initialState, action: SelectDatePickerAction): SelectDatePickerState => {
    switch (action.type) {
        case types.SELECT_DATE_PICKER: {
            return {
                ...state,
                startDate: action.payload.startDate,
                endDate: action.payload.endDate,
            };
        }
        default:
            return initialState;
    }
};

export default SelectDatePickerReducer;
