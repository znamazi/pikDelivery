import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';
import {
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Text,
    View,
} from 'react-native';
import {COLOR_TERTIARY_ERROR, GRAY_LIGHT, GRAY_LIGHT_EXTRA, INPUT_HEIGHT} from '../utils/constants';
// import RNPhoneInput from 'react-native-phone-input'
import RNPhoneInput from './PhonePicker';
import {PhoneNumberUtil} from 'google-libphonenumber';
const phoneUtils = PhoneNumberUtil.getInstance();

// class PhoneInput extends React.Component{
//     constructor(props){
//         super(props)
//
//         this.state = {
//             ...this.getDefaultValue(this.props.value)
//         }
//     }
//
//     getDefaultValue(value){
//         let correctValue=value.toString(),
//             defaultRegionCode = 'ES',
//             defaultCountryCode = '';
//         try {
//             let number = phoneUtils.parseAndKeepRawInput(value)
//             defaultRegionCode = phoneUtils.getRegionCodeForNumber(number).toString();
//             defaultCountryCode = '+' + number.getCountryCode().toString();
//             let nationalNumber = number.getNationalNumber().toString();
//
//             if(value.substr(0,defaultCountryCode.length) === defaultCountryCode)
//                 correctValue = nationalNumber
//
//         }catch (e) {}
//         return {correctValue, defaultCountryCode, defaultRegionCode,}
//     }
//
//     UNSAFE_componentWillReceiveProps(nextProps){
//         let defaultValues = this.getDefaultValue(nextProps.value)
//         this.setState({...defaultValues})
//     }
//
//     render(){
//         let {value, onChangeText, errorText, onChangeFormattedText} = this.props;
//         let {correctValue, defaultRegionCode} = this.state;
//         return <View style={[styles.wrapper, {marginBottom: errorText ? 16 : 0}]}>
//             <RNPhoneInput
//                 defaultValue={correctValue}
//                 defaultCode={defaultRegionCode}
//                 // onChangeText={(text) => {
//                 //     setValue(text);
//                 // }}
//                 onChangeText={onChangeText}
//                 onChangeFormattedText={onChangeFormattedText}
//                 textContainerStyle={[styles.text, {
//                     borderWidth: errorText ? 1 : 0,
//                     borderColor: COLOR_TERTIARY_ERROR,
//                 }]}
//                 flagButtonStyle={styles.flag}
//                 textInputProps={{
//                     underlineColorAndroid: 'transparent',
//                 }}
//                 codeTextStyle={{
//                     height: INPUT_HEIGHT,
//                     lineHeight: INPUT_HEIGHT,
//                 }}
//                 textInputStyle={{
//                     height: INPUT_HEIGHT,
//                     borderWidth: 0,
//                     lineHeight: INPUT_HEIGHT,
//                 }}
//                 errorText={errorText}
//                 // withDarkTheme
//                 // withShadow
//                 // autoFocus
//             />
//         </View>;
//     }
// }
// PhoneInput.propTypes = {
//     value: PropTypes.oneOf([
//         PropTypes.string,
//         PropTypes.number,
//     ]),
//     errorText: PropTypes.string,
//     onChangeText: PropTypes.func,
//     onChangeFormattedText: PropTypes.func
// }


const PhoneInput = ({value, onChangeText, errorText, onChangeFormattedText}) => {
    let correctValue=value.toString(),
        defaultRegionCode = undefined,
        defaultCountryCode = '';
    try {
        let number = phoneUtils.parseAndKeepRawInput(value)
        defaultRegionCode = phoneUtils.getRegionCodeForNumber(number).toString();
        defaultCountryCode = '+' + number.getCountryCode().toString();
        let nationalNumber = number.getNationalNumber().toString();

        if(value.substr(0,defaultCountryCode.length) === defaultCountryCode)
            correctValue = nationalNumber
        // console.log({correctValue, defaultRegionCode, defaultCountryCode})
    }catch (e) {}

    const [formattedValue, setFormattedValue] = useState('');
    const [valid, setValid] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const phoneInput = useRef(null);

    return <View style={[styles.wrapper, {marginBottom: errorText ? 16 : 0}]}>
        {showMessage && (
            <View style={styles.message}>
                <Text>Value : {value}</Text>
                <Text>Formatted Value : {formattedValue}</Text>
                <Text>Valid : {valid ? 'true' : 'false'}</Text>
            </View>
        )}
        <RNPhoneInput
            // flagStyle={styles.flag}
            // textStyle={styles.text}
            // textProps={{
            //     underlineColorAndroid: 'transparent',
            // }}

            ref={phoneInput}
            defaultValue={correctValue}
            defaultCode={defaultRegionCode}
            // onChangeText={(text) => {
            //     setValue(text);
            // }}
            onChangeText={onChangeText}
            onChangeFormattedText={(text) => {
                setFormattedValue(text);
            }}
            onChangeFormattedText={onChangeFormattedText}
            textContainerStyle={styles.text}
            flagButtonStyle={styles.flag}
            textInputProps={{
                underlineColorAndroid: 'transparent',
            }}
            codeTextStyle={{
                height: INPUT_HEIGHT,
                lineHeight: INPUT_HEIGHT,
            }}
            textInputStyle={{
                height: INPUT_HEIGHT,
                borderWidth: 0,
                lineHeight: INPUT_HEIGHT,
            }}
            textContainerStyle={{
                borderWidth: errorText ? 1 : 0,
                borderColor: COLOR_TERTIARY_ERROR,
            }}
            errorText={errorText}
            // withDarkTheme
            // withShadow
            // autoFocus
        />
    </View>;
};

const styles = StyleSheet.create({
    wrapper: {
        height: INPUT_HEIGHT,
    },
    flag: {
        height: INPUT_HEIGHT,
        resizeMode: 'contain',
        backgroundColor: GRAY_LIGHT_EXTRA,
        overlayColor: 'white',
        borderWidth: 0,
        paddingRight: 5,
        marginRight: 5,
        borderRadius: 5,
    },
    text: {
        backgroundColor: GRAY_LIGHT_EXTRA,
        height: INPUT_HEIGHT,
        lineHeight: INPUT_HEIGHT,
        borderRadius: 5,
        paddingHorizontal: 5,
    },
});

export default PhoneInput;
