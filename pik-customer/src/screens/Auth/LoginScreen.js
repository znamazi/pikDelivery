import React, {useState} from 'react';
import {GoogleSignin, statusCodes} from '@react-native-community/google-signin';
import {
    ScrollView,
    KeyboardAvoidingView,
    StyleSheet,
    Image,
    View,
    Text, StatusBar,
} from 'react-native';
import {
    ORANGE,
    GRAY_LIGHT,
    PAGE_PADDING,
    COLOR_TERTIARY_HYPERLINK,
} from '../../utils/constants';
import ButtonPrimary from '../../components/ButtonPrimary';
import CustomAnimatedInput from '../../components/CustomAnimatedInput';
import KeyboardAvoidingScreen from '../../components/KeyboardAvoidingScreen';
import ButtonSocial from '../../components/ButtonSocial';
import withAuth from '../../redux/connectors/withAuth';
import {isEmail, isMobile} from '../../utils/validator';
import Api from '../../utils/api';
import _ from 'lodash';
import PageContainerLight from '../../components/PageContainerLight';
import AlertBootstrap from '../../components/AlertBootstrap';
import globalStyles from '../../utils/globalStyles';

const LoginScreen = ({navigation, authLogin, authLoginWith}) => {
    let [validationEnabled, setValidationEnabled] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loginBusy, setLoginBusy] = useState(false)
    const [loginInProgress, setLoginInProgress] = useState(false)
    const [facebookInProgress, setFacebookInProgress] = useState(false)
    const [googleInProgress, setGoogleInProgress] = useState(false)

    // ================ Validations ====================
    const validateEmail = () => {
        if (!email.trim()) {
            return 'Enter your email address';
        }
        if (!isEmail(email.trim())) {
            return 'Incorrect email address';
        }
    };
    const validatePassword = () => {
        if (!password) {
            return 'Enter your password';
        }
    };
    // =================================================
    const _signIn = () => {
        setError('');
        let error = [
            validateEmail(),
            validatePassword(),
        ].filter(_.identity);

        if (error.length > 0) {
            setError('Some data fields has error');
            setValidationEnabled(true);
            return;
        }

        setLoginInProgress(true)
        setLoginBusy(true)
        authLogin(email, password)
            .then(({success, message, token}) => {
                console.log({success, message, token});
                if (!success) {
                    setError(message || 'Something went wrong');
                }
            })
            .catch(() => {
            })
            .then(() => {
                setLoginInProgress(false)
                setLoginBusy(false)
            })
    };

    const onFacebookButtonClick = async () => {
        setFacebookInProgress(true)
        setLoginBusy(true)
        Api.Auth.signinWithFacebook()
            .then(onSocialLoginSuccess)
            .catch(error => {
                setError(error.message || 'Somethings went wrong')
            })
            .then(() => {
                setFacebookInProgress(false)
                setLoginBusy(false)
            })
    }

    const onGoogleButtonClick = async () => {
        setGoogleInProgress(true)
        setLoginBusy(true)
        Api.Auth.signinWithGoogle()
            .then(onSocialLoginSuccess)
            .catch(() => {})
            .then(() => {
                setGoogleInProgress(false)
                setLoginBusy(false)
            })
    };

    const onSocialLoginSuccess = ({success, user, token, message, registered}) => {
        if(success) {
            if (registered) {
                authLoginWith(token, user);
            } else {
                navigation.replace('AuthRegister', {socialUser: user});
            }
        }
        else {
            setError(message || "Server side error")
        }

    }

    return (
        <KeyboardAvoidingScreen>
            <PageContainerLight
                footer={(
                    <View style={{padding: 16}}>
                        {!!error && (
                            <View style={globalStyles.inputWrapper}>
                                <AlertBootstrap
                                    message={error}
                                    type="danger"
                                    onClose={() => setError('')}
                                />
                            </View>
                        )}
                        <ButtonPrimary
                            title="Login"
                            onPress={_signIn}
                            inProgress={loginInProgress}
                            disabled={loginBusy}
                        />
                        <Text style={styles.textSignup}>
                            You dont have an account?
                            <Text onPress={() => navigation.replace('AuthRegister')} style={styles.link}> Signup</Text>
                        </Text>
                    </View>
                )}
            >
                    <Text style={styles.title}>Welcome back, use your email and password to log in.</Text>
                    <View style={styles.inputWrapper}>
                        <CustomAnimatedInput
                            value={email}
                            onChangeText={text => setEmail(text)}
                            placeholder={'Username'}
                            errorText={validationEnabled && validateEmail()}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <CustomAnimatedInput
                            value={password}
                            onChangeText={text => setPassword(text)}
                            type='password'
                            placeholder={'Password'}
                            errorText={validationEnabled && validatePassword()}
                        />
                        <Text onPress={() => navigation.navigate('AuthPasswordRecovery')}
                              style={styles.forgetPassTitle}>Forget your password?</Text>
                    </View>


                    <Text style={styles.description}>Or via social media</Text>
                    <View style={styles.inputWrapper}>
                        <ButtonSocial
                            type='facebook'
                            title="Continue with Facebook"
                            onPress={onFacebookButtonClick}
                            inProgress={facebookInProgress}
                            disabled={loginBusy}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <ButtonSocial
                            type='google'
                            title="Continue with Google"
                            onPress={onGoogleButtonClick}
                            inProgress={googleInProgress}
                            disabled={loginBusy}
                        />
                    </View>
            </PageContainerLight>
        </KeyboardAvoidingScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: PAGE_PADDING,
        backgroundColor: 'white',
    },
    title: {
        textAlign: 'center',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
        paddingHorizontal: 50,
        paddingTop: 50,
        color: GRAY_LIGHT,
        marginBottom: 32,
    },
    description: {
        textAlign: 'center',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
        paddingHorizontal: 50,
        paddingVertical: 16,
        color: GRAY_LIGHT,
    },
    inputWrapper: {
        marginBottom: 15,
        flex: 1,
    },
    forgetPassTitle: {
        marginTop: 10,
        color: ORANGE,
        textAlign: 'right',
    },
    textSignup: {
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
    },
    link: {
        color: COLOR_TERTIARY_HYPERLINK,
    },
    errorMessage: {
        color: 'red',
        padding: 10,
        backgroundColor: '#fdd',
        borderWidth: 1,
        borderColor: '#fbb',
        borderRadius: 5,
        marginBottom: 5,
    }
});

export default withAuth(LoginScreen);
