import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Alert} from 'react-native';
import KeyboardAvoidingScreen from '../../../components/KeyboardAvoidingScreen';
import PageContainerDark from '../../../components/PageContainerDark';
import HeaderPage from '../../../components/HeaderPage';
import CustomAnimatedInput from '../../../components/CustomAnimatedInput';
import PrimaryButton from '../../../components/ButtonPrimary';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const MyAddressEditScreen = ({navigation, route}) => {
    let {name: oldName="", address, onConfirm, onDelete} = route.params || {};
    const [inProgress, setInProgress] = useState(false)
    const [name, setName] = useState(oldName);
    const [formattedAddress, setFormattedAddress] = useState(address.formatted_address);
    const [validationEnabled, setValidationEnabled] = useState(false)

    const validateAddress = () => {
        if(!formattedAddress)
            return 'Enter address'
    }
    const validateName = () => {
        if(!name)
            return 'Enter name for your address'
    }

    const confirm = async () => {
        let errors = [
            validateAddress(),
            validateName()
        ].filter(e => !!e)

        if(errors.length > 0){
            setValidationEnabled(true)
            return;
        }

        if(onConfirm){
            let newAddress = {...address}
            newAddress.formatted_address = formattedAddress
            setInProgress(true)
            await onConfirm(name, newAddress)
            setInProgress(false)
        }
    }

    const callDelete = () => {
        Alert.alert(
            '',
            'Are you sure want to delete address?',
            [
                {
                    text: 'Cancel',
                    onPress: () => {},
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: async () => {
                        setInProgress(true)
                        await onDelete()
                        setInProgress(false)
                    },
                },
            ],
            {cancelable: false},
        );
    }

    return (
        <KeyboardAvoidingScreen>
            <PageContainerDark
                Header={
                    <HeaderPage
                        title={'My Address'}
                        color={HeaderPage.Colors.BLACK}
                        rightButtons={!!onDelete ? [
                            <TouchableOpacity onPress={() => callDelete()}>
                                <FontAwesome5 style={styles.deleteBtn} name="trash-alt"/>
                            </TouchableOpacity>
                        ] : null}
                    />
                }
                footer={(
                    <View style={{padding: 16}}>
                        <PrimaryButton
                            title="Save Address"
                            onPress={() => confirm()}
                            inProgress={inProgress}
                            disabled={inProgress}
                        />
                    </View>
                )}

            >
                {/*<Text style={styles.title}>Address</Text>*/}
                <View style={styles.inputWrapper}>
                    <CustomAnimatedInput
                        placeholder={'Address'}
                        value={formattedAddress}
                        onChangeText={setFormattedAddress}
                        errorText={validationEnabled && validateAddress()}
                    />
                </View>
                <View style={styles.inputWrapper}>
                    <CustomAnimatedInput
                        placeholder={'Name'}
                        value={name}
                        onChangeText={setName}
                        errorText={validationEnabled && validateName()}
                    />
                </View>
            </PageContainerDark>
        </KeyboardAvoidingScreen>
    );
};

const styles = StyleSheet.create({
    container: {},
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 40,
    },
    inputWrapper: {
        marginBottom: 15,
    },
    deleteBtn: {
        fontWeight: '900',
        fontSize: 20,
        marginRight: 8,
        color: 'white'
    }
});

export default MyAddressEditScreen;
