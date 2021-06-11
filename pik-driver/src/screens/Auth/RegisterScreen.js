import React, {useState} from 'react';
import _ from 'lodash';
import {
    StyleSheet,
    View,
    Text, StatusBar,
} from 'react-native';
import HeaderPage from '../../components/HeaderPage';
import CustomAnimatedInput from '../../components/CustomAnimatedInput';
import PhoneInput from '../../components/PhoneInput';
import CustomCheckbox from '../../components/CustomCheckbox';
import {BLACK, BLUE, COLOR_TERTIARY_ERROR, GRAY_LIGHT, PAGE_PADDING} from '../../utils/constants';
import Button from '../../components/ButtonPrimary';
import PageContainerDark from '../../components/PageContainerDark';
import KeyboardAvoidingScreen from '../../components/KeyboardAvoidingScreen';
import {isEmail, isMobile} from '../../utils/validator';
import Api from '../../utils/api';
import AlertBootstrap from '../../components/AlertBootstrap';

const RegisterScreen = ({navigation}) => {
    let [validationEnabled, setValidationEnabled] = useState(false)
    let [mobileUnformatted, setMobileUnformatted] = useState('');
    let [mobile, setMobile] = useState('');
    let [email, setEmail] = useState('');
    let [password, setPassword] = useState('');
    let [iAccept, setIAccept] = useState(false)
    let [error, setError] = useState('');
    let [inProgress, setInProgress] = useState(false)

    // ================ Validations ====================
    const validateEmail = () => {
        if(!email.trim())
            return "Enter your email address"
        if(!isEmail(email.trim()))
            return "Incorrect email address"
    }
    const validatePassword = () => {
        if(!password)
            return "Enter your password";
    }
    const validateMobile = () => {
        if(!mobile.trim())
            return "Enter your mobile number";
        if(!isMobile(mobile.trim()))
            return "Incorrect mobile number";
    }
    const validateConditionAccept = () => {
        if(!iAccept)
            return "Read and accept conditions";
    }
    // =================================================

    const register = () => {
        setError('')
        let error = [
            validateEmail(),
            validatePassword(),
            validateMobile(),
            validateConditionAccept(),
        ].filter(_.identity)

        if(error.length > 0){
            setError(`${error.length} error${error.length>1?'s':''} occurred. Check the form and try again.`)
            setValidationEnabled(true);
            return;
        }

        setInProgress(true);
        Api.Auth.register(mobile, email, password)
            .then(({success, user, message}) => {
                if (success) {
                    navigation.push('AuthConfirmMobile', {user});
                } else {
                    setError(message || 'Server side error');
                }
            })
            .catch(error => {
                console.log(error);
            })
            .then(() => {
                setInProgress(false)
            })
    };
    return (
        <KeyboardAvoidingScreen>
            <PageContainerDark
                Header={<HeaderPage
                    navigation={navigation}
                    title={'Create Account'}
                    color={HeaderPage.Colors.BLACK}
                />}
                footer={(
                    <View style={{paddingHorizontal: 16, paddingBottom: 16}}>
                        {!!error && (
                            <View style={styles.inputWrapper}>
                                <AlertBootstrap
                                    type="danger"
                                    message={error}
                                    onClose={() => setError('')}
                                />
                            </View>
                        )}
                        <Button
                            title="Next"
                            onPress={register}
                            inProgress={inProgress}
                            disabled={inProgress}
                        />
                    </View>
                )}
            >
                <Text style={styles.title}>Enter your Account Details</Text>
                <Text style={styles.description}>Please be sure you enter correct information</Text>
                <View style={styles.inputWrapper}>
                    <PhoneInput
                        value={mobileUnformatted}
                        onChangeText={setMobileUnformatted}
                        onChangeFormattedText={setMobile}
                        errorText={validationEnabled && validateMobile()}
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <CustomAnimatedInput
                        placeholder={'Email'}
                        type="email"
                        value={email}
                        onChangeText={setEmail}
                        errorText={validationEnabled && validateEmail()}
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <CustomAnimatedInput
                        placeholder={'Password'}
                        type="password"
                        value={password}
                        onChangeText={setPassword}
                        errorText={validationEnabled && validatePassword()}
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <CustomCheckbox
                        value={iAccept}
                        disabled={false}
                        onValueChange={n => setIAccept(n)}
                        errorText={validationEnabled && validateConditionAccept()}
                    >
                        <Text style={{fontWeight: '400', fontSize: 14, lineHeight: 24}}>
                            I accept
                            <Text onPress={() => navigation.navigate('AuthTermsAndConditions')} style={styles.link}> terms, conditions </Text>
                            and
                            <Text onPress={() => navigation.navigate('AuthDataPrivacy')} style={styles.link}> data privacy agreements </Text>
                            from PIK
                        </Text>
                    </CustomCheckbox>
                </View>
            </PageContainerDark>
        </KeyboardAvoidingScreen>
    );
};

const styles = StyleSheet.create({
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 13,
        textAlign: 'center',
        color: GRAY_LIGHT,
        marginBottom: 40,
    },
    inputWrapper: {
        marginBottom: 15,
    },
    link: {
        color: BLUE,
    },
});

export default RegisterScreen;
