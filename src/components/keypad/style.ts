import { StyleSheet } from "react-native";

export default StyleSheet.create({
	container: {
	},
	row: {
		flexDirection: 'row',
        marginTop: 15,
	},
	number: {
		fontSize: 25,
		textAlign: 'center',
	},
	backspace: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cell: {
        justifyContent: 'center',
        alignItems:'center',
        width:112,
        height:48,
	},
})