import React, {useState} from 'react';
import _ from 'lodash'
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
import Api from '../../utils/api';
import ButtonSocial from '../../components/ButtonSocial';
import {isEmail, isMobile} from '../../utils/validator';
import ViewCollapsable from '../../components/ViewCollapsable';
import Avatar from '../../components/Avatar';
import globalStyles from '../../utils/globalStyles';
import withAuth from '../../redux/connectors/withAuth';

const RegisterScreen = ({navigation, route, authLoginWith}) => {
    let [inProgress, setInProgress] = useState(false)
    let [validationEnabled, setValidationEnabled] = useState(false)
    let [mobileUnformatted, setMobileUnformatted] = useState('');
    let [socialUser, setSocialUser] = useState(route?.params?.socialUser || null)
    let [mobile, setMobile] = useState('');
    let [name, setName] = useState('');
    let [email, setEmail] = useState(!!route?.params?.socialUser?.email ? route.params.socialUser.email : '');
    let [password, setPassword] = useState('');
    let [password2, setPassword2] = useState('');
    let [error, setError] = useState('');

    // ================ Validations ====================
    const validateName = () => {
        if(!name.trim())
            return "Enter your full name"
    }
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
    // =================================================

    const register = () => {
        setError('')
        let error = [
            ...(!!socialUser ? [
            ] : [
                validateName(),
                validatePassword(),
            ]),
            validateEmail(),
            validateMobile()
        ].filter(_.identity)

        if(error.length > 0){
            setError(`${error.length} error${error.length>1?'s':''} occurred. Check the form and try again.`)
            setValidationEnabled(true);
            return;
        }

        setInProgress(true)
        Api.Auth.register(name, mobile, email, password, socialUser?._id)
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

    const onFacebookButtonClick = async () => {
        Api.Auth.signinWithFacebook().then(onSocialLoginSuccess)
    }

    const onGoogleButtonClick = async () => {
        Api.Auth.signinWithGoogle().then(onSocialLoginSuccess)
    };

    const onSocialLoginSuccess = ({success, user, token, message, registered}) => {
        if(success) {
            if (registered) {
                authLoginWith(token, user);
            } else {
                setEmail(user.email || "")
                setSocialUser(user)
            }
        }
        else {
            setError(message || "Server side error")
        }

    }

    return (
        <KeyboardAvoidingScreen>
            <PageContainerDark
                Header={<HeaderPage
                    title={'Create Account'}
                    color={HeaderPage.Colors.BLACK}
                />}
                footer={(
                    <View style={{paddingHorizontal: 16, paddingBottom: 8}}>
                        <Button
                            title="Next"
                            inProgress={inProgress}
                            disabled={inProgress}
                            onPress={register}
                        />
                        <Text style={styles.agreement}>
                            By creating an account you accept
                            <Text onPress={() => navigation.navigate('AuthTermsAndConditions')} style={styles.link}> terms, conditions </Text>
                            and
                            <Text onPress={() => navigation.navigate('AuthDataPrivacy')} style={styles.link}> data privacy agreements </Text>
                            from PIK
                        </Text>
                    </View>
                )}
            >
                <View style={{flexGrow: 1}}>
                    <ViewCollapsable collapsed={!!socialUser}>
                        <View style={styles.inputWrapper}>
                            <ButtonSocial
                                type="facebook"
                                title="Register with Facebook"
                                onPress={onFacebookButtonClick}
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <ButtonSocial
                                type="google"
                                title="Register with Google"
                                onPress={onGoogleButtonClick}
                            />
                        </View>
                        <Text style={styles.description}>Or register with your email</Text>
                        <View style={styles.inputWrapper}>
                            <CustomAnimatedInput
                                placeholder={'Full Name'}
                                value={name}
                                onChangeText={setName}
                                errorText={validationEnabled && validateName()}
                            />
                        </View>
                    </ViewCollapsable>
                    <ViewCollapsable collapsed={!socialUser}>
                        <View style={globalStyles.inputWrapper}>
                            <View style={[globalStyles.flexRowCenter, {justifyContent: 'center'}]}>
                                <Avatar source={{uri: socialUser?.avatar}} />
                            </View>
                            <Text style={{fontWeight: '700', fontSize: 16, marginVertical: 24, textAlign: 'center'}}>
                                {socialUser?.firstName} {socialUser?.lastName}
                            </Text>
                        </View>
                    </ViewCollapsable>
                    {(!socialUser?.email) && <View style={styles.inputWrapper}>
                        <CustomAnimatedInput
                            placeholder={'Email'}
                            value={email}
                            type="email"
                            onChangeText={setEmail}
                            errorText={validationEnabled && validateEmail()}
                        />
                    </View>}

                    {!socialUser && <View style={styles.inputWrapper}>
                        <CustomAnimatedInput
                            placeholder={'Password'}
                            value={password}
                            type="password"
                            onChangeText={setPassword}
                            errorText={validationEnabled && validatePassword()}
                        />
                    </View>}
                    <View style={styles.inputWrapper}>
                        <PhoneInput
                            value={mobileUnformatted}
                            onChangeText={setMobileUnformatted}
                            onChangeFormattedText={setMobile}
                            errorText={validationEnabled && validateMobile()}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        {!!error && <Text style={{color: COLOR_TERTIARY_ERROR}}>{error}</Text>}
                    </View>
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
        textAlign: 'center',
        fontWeight: "400",
        fontSize: 14,
        lineHeight: 24,
        color: GRAY_LIGHT,
        marginBottom: 16,
    },
    inputWrapper: {
        marginBottom: 15,
    },
    agreement:{
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
    },
    link: {
        color: BLUE,
    },
});

export default withAuth(RegisterScreen);
