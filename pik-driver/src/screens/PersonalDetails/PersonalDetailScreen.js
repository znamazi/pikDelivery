import React, {useState, useEffect} from 'react';
import moment from 'moment'
import {
    StyleSheet,
    Picker,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import VehicleTypes from '../../../../node-back/src/constants/VehicleTypes'
import HeaderPage from '../../components/HeaderPage';
import CustomAnimatedInput from '../../components/CustomAnimatedInput';
import {BLUE, COLOR_TERTIARY_ERROR, GRAY_LIGHT} from '../../utils/constants';
import Button from '../../components/ButtonPrimary';
import PageContainerDark from '../../components/PageContainerDark';
import KeyboardAvoidingScreen from '../../components/KeyboardAvoidingScreen';
import RadioInput from '../../components/RadioInput';
import CustomPicker from '../../components/CustomPicker';
import {useAuth} from '../../utils/auth';
import Api from '../../utils/api';
import BirthdayPicker from '../../components/BirthdayPicker';
import _ from 'lodash';
import globalStyles from '../../utils/globalStyles';
import AlertBootstrap from '../../components/AlertBootstrap';


const PersonalDetailsScreen = ({navigation}) => {
    const auth = useAuth();
    let [validationEnabled, setValidationEnabled] = useState(false)
    const [error, setError] = useState('');
    const [firstName, setFirstName] = useState(auth.user.firstName || '');
    const [lastName, setLastName] = useState(auth.user.lastName || '');
    const [address, setAddress] = useState(auth.user.address || '');
    const [birthDate, setBirthDate] = useState(auth.user.birthDate || '');
    const [gender, setGender] = useState(auth.user.gender || null);
    const [vehicle, setVehicle] = useState(auth.user.vehicle?.type || null);
    const [inProgress, setInProgress] = useState(false)

    // ================ Validations ====================
    const validateFirstName = () => {
        if(!firstName.trim())
            return "Enter your first name"
    }
    const validateLastName = () => {
        if(!lastName.trim())
            return "Enter your last name"
    }
    const validateAddress = () => {
        if(!address.trim())
            return "Enter your address"
    }
    const validateBirthDate = () => {
        if(!birthDate.trim())
            return "Select your birthday"
        if(!moment(birthDate, 'YYYY-MM-DD').isValid())
            return "Incorrect date"
    }
    const validateGender = () => {
        if(!gender)
            return "Select your gender"
    }
    const validateVehicle = () => {
        if(!vehicle)
            return "Select your vehicle"
    }
    // =================================================

    const update = () => {
        setError('')
        let error = [
            validateFirstName(),
            validateLastName(),
            validateAddress(),
            validateBirthDate(),
            validateGender(),
            validateVehicle(),
        ].filter(_.identity)

        if(error.length > 0){
            setError(`${error.length} error${error.length>1?'s':''} occurred. Check the form and try again.`)
            setValidationEnabled(true);
            return;
        }

        setInProgress(true)
        Api.Driver.updatePersonalInfo({
            firstName, lastName, address, birthDate, gender, vehicleType: vehicle,
        })
            .then(({success, message}) => {
                if (success) {
                    auth.reloadUserInfo();
                    navigation.push('PersonalDetailDocumentsScreen');
                } else {
                    setError(message || 'Somethings went wrong');
                }
            })
            .catch(error => {
                setError(error?.response?.data?.message || error?.message || 'Somethings went wrong');
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
            >
                <View style={{flexGrow: 1}}>
                    <Text style={styles.title}>Enter your personal details</Text>
                    <Text style={styles.description}>Registration is only allowed for adults.</Text>
                    <Text style={styles.description}>Enter your full name exactly as it appears on your ID</Text>

                    <View style={{height: 40}}/>

                    <View style={styles.inputWrapper}>
                        <CustomAnimatedInput
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder={'First Name'}
                            errorText={validationEnabled && validateFirstName()}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <CustomAnimatedInput
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder={'Last Name'}
                            errorText={validationEnabled && validateLastName()}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <CustomAnimatedInput
                            value={address}
                            onChangeText={setAddress}
                            placeholder={'Address'}
                            errorText={validationEnabled && validateAddress()}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <BirthdayPicker
                            placeholder="Birth Date"
                            value={birthDate}
                            onChange={setBirthDate}
                            errorText={validationEnabled && validateBirthDate()}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <RadioInput
                            items={['Male', 'Female']}
                            value={gender}
                            onChange={g => setGender(g)}
                            errorText={validationEnabled && validateGender()}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <CustomPicker
                            selectedValue={vehicle}
                            onValueChange={(itemValue, itemIndex) => setVehicle(itemValue)}
                            items={Object.values(VehicleTypes)}
                            placeholder={'Select your vehicle'}
                            errorText={validationEnabled && validateVehicle()}
                        />
                    </View>
                </View>
                <View style={{flexGrow: 0}}>
                    {!!error && (
                        <View style={globalStyles.inputWrapper}>
                            <AlertBootstrap
                                type="danger"
                                message={error}
                                onClose={() => setError('')}
                            />
                        </View>
                    )}
                    <Button
                        title="Next"
                        onPress={update}
                        inProgress={inProgress}
                        disabled={inProgress}
                    />
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
    },
    inputWrapper: {
        marginBottom: 15,
    },
    link: {
        color: BLUE,
    },
});

export default PersonalDetailsScreen;
