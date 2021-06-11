import React, {useState} from 'react'
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Text
} from 'react-native'
import KeyboardAvoidingScreen from '../../../components/KeyboardAvoidingScreen';
import PageContainerDark from '../../../components/PageContainerDark';
import HeaderPage from '../../../components/HeaderPage';
import {GRAY_LIGHT} from '../../../utils/constants';
import globalStyles from '../../../utils/globalStyles';
import CustomAnimatedInput from '../../../components/CustomAnimatedInput';
import RadioInput from '../../../components/RadioInput';
import FormControl from '../../../components/FormControl';
import CustomPicker from '../../../components/CustomPicker';
import ButtonPrimary from '../../../components/ButtonPrimary';
import Api from '../../../utils/api'
import AlertBootstrap from '../../../components/AlertBootstrap';
import {isEmail} from '../../../utils/validator';
import _ from 'lodash';
import PhoneInput from '../../../components/PhoneInput';

const BankAccountScreen = ({navigation}) => {
    const [inProgress, setInProgress] = useState(false)
    const [accountName, setAccountName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [accountType, setAccountType] = useState('')
    const [accountBank, setAccountBank] = useState('')

    const [validationEnabled, setValidationEnabled] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')

    // ================ Validations ====================
    const validateAccountName = () => {
        if(!accountName.trim())
            return "Enter your account name"
    }
    const validateAccountNumber = () => {
        if(!accountNumber.trim())
            return "Enter your account number"
    }
    const validateAccountType = () => {
        if(!accountType.trim())
            return "Select your account type"
    }
    const validateAccountBank = () => {
        if(!accountBank.trim())
            return "Select your account Bank"
    }
    // =================================================

    const saveChanges = () => {
        setMessage('')
        setMessageType('')
        let error = [
            validateAccountName(),
            validateAccountNumber(),
            validateAccountType(),
            validateAccountBank(),
        ].filter(_.identity)

        if(error.length > 0){
            setValidationEnabled(true);
            return;
        }

        setInProgress(true)
        Api.Driver.postBankAccount(accountName, accountNumber, accountType,accountBank)
            .then(({success, message}) => {
                if(success){
                    setMessageType('success')
                    setMessage('Bank account info registered successfully')
                }
                else{
                    setMessageType('danger')
                    setMessage(message || "Somethings went wrong")
                }
            })
            .catch(error => {
                setMessageType('danger')
                setMessage(
                    error?.response?.data?.message ||
                    error?.message ||
                    'Somethings went wrong',)
            })
            .then(() => {
                setInProgress(false)
            })
    }

    React.useEffect(() => {
        Api.Driver.getBankAccount()
            .then(({success, account, message}) => {
                if(success && account) {
                    setAccountName(account.accountName)
                    setAccountNumber(account.accountNumber)
                    setAccountType(account.accountType)
                    setAccountBank(account.accountBank)
                }
            })
    }, [])

    return (
        <KeyboardAvoidingScreen >
            <PageContainerDark
                Header={<HeaderPage
                    navigation={navigation}
                    title={'Get Paid'}
                />}
                footer={(
                    <View style={{padding: 16}}>
                        <ButtonPrimary
                            title="Save"
                            onPress={() => saveChanges()}
                            inProgress={inProgress}
                            disabled={inProgress}
                        />
                    </View>
                )}
            >
                <Text style={styles.title}>Enter your Bank Details</Text>
                <Text style={styles.description}>
                    Be sure enter your bank details correctly for
                    avoid payment delays
                </Text>
                <View style={globalStyles.inputWrapper}>
                    <CustomAnimatedInput
                        placeholder={'Account Name'}
                        value={accountName}
                        onChangeText={setAccountName}
                        errorText={validationEnabled && validateAccountName()}
                    />
                </View>
                <View style={globalStyles.inputWrapper}>
                    <CustomAnimatedInput
                        placeholder={'Account No'}
                        value={accountNumber}
                        onChangeText={setAccountNumber}
                        errorText={validationEnabled && validateAccountNumber()}
                    />
                </View>
                <View style={globalStyles.inputWrapper}>
                    <RadioInput
                        items={['Savings Accounts', 'Checking Accounts']}
                        value={accountType}
                        onChange={setAccountType}
                        errorText={validationEnabled && validateAccountType()}
                        // vertical
                    />
                </View>
                <View style={globalStyles.inputWrapper}>
                    <CustomPicker
                        placeholder="Select Your Bank"
                        items={[
                            // https://www.panamabanks.info/list-of-banks-in-panama
                            'Banco Aliado', 'Banco Delta', 'Banco General', 'Banco Lafise Panama',
                            'Banco Prival', 'Canal Bank', 'Capital Bank', 'Credicorp Bank', 'Global Bank',
                            'La Hipotecaria', 'Metrobank', 'MMG Bank', 'Multibank', 'Towerbank', 'Unibank',
                            'Banco Nacional de Panama', 'Caja de Ahorros'
                        ]}
                        selectedValue={accountBank}
                        onValueChange={setAccountBank}
                        errorText={validationEnabled && validateAccountBank()}
                    />
                </View>
                {!!message && (
                    <View style={globalStyles.inputWrapper}>
                        <AlertBootstrap
                            message={message}
                            type={messageType}
                            onClose={() => {
                                setMessageType('')
                                setMessage('')
                            }}
                        />
                    </View>
                )}
            </PageContainerDark>
        </KeyboardAvoidingScreen>
    )
}

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
})

export default BankAccountScreen;
