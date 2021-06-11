import React, {useState, useRef, useEffect} from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import {
    addNewOrder as addNewOrderAction,
} from '../../../redux/actions/appActions';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
} from 'react-native';
import Api from '../../../utils/api';
import {
    GRAY_LIGHT_EXTRA,
    COLOR_PRIMARY_900, COLOR_NEUTRAL_GRAY,
} from '../../../utils/constants';
import PrimaryButton from '../../../components/ButtonPrimary';
import KeyboardAvoidingScreen from '../../../components/KeyboardAvoidingScreen';
import PageContainerDark from '../../../components/PageContainerDark';
import HeaderPage from '../../../components/HeaderPage';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import globalStyles from '../../../utils/globalStyles';
import CustomAnimatedInput from '../../../components/CustomAnimatedInput';
import RadioInput from '../../../components/RadioInput';
import PhoneInput from '../../../components/PhoneInput';
import PaymentMethodPicker from '../../../components/PaymentMethodPicker';
import ViewCollapsable from '../../../components/ViewCollapsable';
import LocationPicker from '../../../components/LocationPicker';
import {clearPhoneNumber, obj2FormData, priceToFixed} from '../../../utils/helpers';
import {PhoneNumberUtil} from 'google-libphonenumber';
const phoneUtils = PhoneNumberUtil.getInstance();

import {VehicleTypeBtn, navigateToOrderDetail} from './HomeSendPackageScreen';
import UserInfo from '../../../components/UserInfo';

const HomeRequestPackageScreen = ({navigation, route, ...props}) => {
    const [inProgress, setInProgress] = useState(false);
    const [error, setError] = useState('');
    const [validateEnabled, setValidateEnabled] = useState(false);
    const [vehicleType, setVehicleType] = useState('Motorcycle')
    const [pickupAddress, setPickupAddress] = useState(null)
    const [hasSenderNote, setHasSenderNote] = useState(false)
    const [senderNote, setSenderNote] = useState('')
    const [hasPickupNote, setHasPickupNote] = useState(false)
    const [pickupNote, setPickupNote] = useState('')
    const [deliveryAddress, setDeliveryAddress] = useState(null)
    const [requestPickupLocation, setRequestPickupLocation] = useState('Select')
    const [hasDeliveryNote, setHasDeliveryNote] = useState(false)
    const [deliveryNote, setDeliveryNote] = useState('')
    const [personName, setPersonName] = useState('')
    const [personContact, setPersonContact] = useState(null)
    const [personMobile, setPersonMobile] = useState('')
    const [person, setPerson] = useState(null);
    const [personNotFound, setPersonNotFound] = useState(false);
    const [mobileUnFormatted, setMobileUnFormatted] = useState('')
    const [creditCard, setCreditCard] = useState(null)
    const [seePriceBreakDown, setSeePriceBreakDown] = useState(false)
    const [direction, setDirection] = useState(null);
    const [price, setPrice] = useState(null);

    const selectPickupLocation = () => {
        navigation.navigate('LocationGet', {setLocation: setPickupAddress, address: pickupAddress})
    }

    const selectDeliveryLocation = () => {
        navigation.navigate('LocationGet', {setLocation: setDeliveryAddress, address: deliveryAddress})
    }

    useEffect(() => {
        if(personContact) {
            setMobileUnFormatted(clearPhoneNumber(personContact.phoneNumbers[0].number))
            setPersonMobile(clearPhoneNumber(personContact.phoneNumbers[0].number))
            if(!personName)
                setPersonName(`${personContact.givenName} ${personContact.familyName}`.trim())
        }
    }, [personContact])

    useEffect(() => {
        setPersonNotFound(false)
        setPerson(null);

        if(!personMobile || validateSenderPhone(personMobile))
            return;

        Api.Customer.getMobileInfo(personMobile)
            .then(({success, message, customer}) => {
                console.log(customer)

                if(success && customer){
                    setPerson(customer);
                }
                else
                    setPersonNotFound(true);
            })
            .catch(error => {
                setPersonNotFound(true);
            })
    }, [personMobile])

    // useEffect(() => {
    //     if(!pickupAddress || !deliveryAddress)
    //         return;
    //     GoogleApi.directions(`place_id:${pickupAddress.place_id}`, `place_id:${deliveryAddress.place_id}`)
    //         .then(direction => {
    //             setDirection(direction);
    //         })
    // },[pickupAddress, deliveryAddress])

    useEffect(() => {
        if(!pickupAddress || !deliveryAddress)
            return;
        Api.Customer.calcOrderPrice(vehicleType, pickupAddress, deliveryAddress)
            .then(({success, price, message}) => {
                console.log(price)
                if(success)
                    setPrice(price);
            })
    },[vehicleType, pickupAddress, deliveryAddress])

    // ======== Validations =============
    const validateAddress = address => {
        if(!address)
            return "Select location"
    }
    const validateSenderName = name => {
        if(!name)
            return "Please write sender name"
    }
    const validateSenderPhone = phone => {
        if(!phone)
            return "Enter sender phone"
        try {
            let number = phoneUtils.parseAndKeepRawInput(phone)
            if (!phoneUtils.isValidNumber(number)) {
                return "Invalid phone number"
            }
        }catch (e) {
            return "Invalid phone number"
        }
    }
    const validateCreditCard = cardNumber => {
        if(!cardNumber)
            return "Please select credit card"
    }
    // ==================================

    const createFormData = () => {
        const data = new FormData();

        let formBody = {
            isRequest: true,
            vehicleType,
            deliveryAddress,
            deliveryNote,
            senderNote,
            payer: 'receiver',
            personName,
            personMobile,
            ...(requestPickupLocation==='Select' ? {
                pickupAddress,
                pickupNote,
            } : {}),
            creditCard,
        }

        obj2FormData(data, formBody, '');

        return data;
    }

    const placeOrder = () => {
        setError('');

        let errors = [
            validateAddress(deliveryAddress),
            validateSenderName(personName),
            validateSenderPhone(personMobile),
            requestPickupLocation==='Select' ? validateAddress(pickupAddress) : null,
            validateCreditCard(creditCard),
        ].filter(_.identity);

        if(errors.length > 0){
            setValidateEnabled(true);
            setError('Some validations failed. check the form data and try again');
            return
        }

        if(!person){
            setValidateEnabled(true);
            setError(`Sender PIK user(${personMobile}) not found`);
            return
        }

        let formData = createFormData();

        Api.Customer.postNewOrder(formData)
            .then(response => {
                console.log("Response", response)
                let {success, message, order} = response
                if(success){
                    props.addNewOrderToRedux(order);
                    if(order.status === 'Pending')
                        navigation.navigate('MainHomeSearchingCarrier', {order})
                    else
                        navigateToOrderDetail(navigation, order._id)
                }
                else{
                    setError(message || "Somethings went wrong")
                }
            })
            .catch(error => {
                setError(error.message || "Somethings went wrong")
                console.error(JSON.stringify(error, null, 2), Date.now())
            })
    }

    return (
        <KeyboardAvoidingScreen>
            <PageContainerDark
                contentStyle={{paddingBottom: 0}}
                Header={
                    <HeaderPage
                        title={'Request Package'}
                        color={HeaderPage.Colors.BLACK}
                    />
                }
                footer={(
                    <PrimaryButton
                        style={{marginHorizontal: -16, borderRadius: 0}}
                        title="Place Order"
                        onPress={() => placeOrder()}
                    />
                )}
            >
                <View style={{flexGrow: 1}}>
                    {/* ===== Vehicle type ===== */}
                    <View style={{padding: 10, marginBottom: 16}}>
                        <View style={styles.flexRow}>
                            <VehicleTypeBtn
                                active={vehicleType === 'Motorcycle'}
                                icon="motorcycle"
                                title=" 32ft / 8kg"
                                onPress={() => setVehicleType('Motorcycle')}
                            />
                            <View style={{width: 13}}/>
                            <VehicleTypeBtn
                                active={vehicleType === 'Car'}
                                icon="car"
                                title=" 32ft / 8kg"
                                onPress={() => setVehicleType('Car')}
                            />
                        </View>
                    </View>

                    {/* ===== Pickup location ===== */}
                    <View style={globalStyles.inputWrapper}>
                        <Text style={styles.h1}>Pickup Location</Text>
                    </View>
                    <View style={globalStyles.inputWrapper}>
                        <RadioInput
                            value={requestPickupLocation}
                            items={['Select', 'Request']}
                            onChange={setRequestPickupLocation}
                        />
                    </View>
                    <ViewCollapsable collapsed={requestPickupLocation!=='Select'}>
                        <View style={globalStyles.inputWrapper}>
                            <LocationPicker
                                placeholder="Select Pickup Location"
                                value={pickupAddress}
                                onPress={selectPickupLocation}
                                errorText={validateEnabled && validateAddress(pickupAddress)}
                            />
                        </View>

                        {/* ===== Pickup Note ===== */}
                        <View style={globalStyles.inputWrapper}>
                            {hasPickupNote ? (
                                <CustomAnimatedInput
                                    placeholder="Driver Note"
                                    autoFocus={true}
                                    value={pickupNote}
                                    onChangeText={setPickupNote}
                                />
                            ) : (
                                <Text
                                    onPress={() => setHasPickupNote(true)}
                                    style={globalStyles.link}
                                >Add Notes To Driver</Text>
                            )}
                        </View>
                    </ViewCollapsable>

                    {/* ===== Sender Note ===== */}
                    <View style={globalStyles.inputWrapper}>
                        {hasSenderNote ? (
                            <CustomAnimatedInput
                                placeholder="Sender Note"
                                autoFocus={true}
                                value={senderNote}
                                onChangeText={setSenderNote}
                            />
                        ) : (
                            <Text
                                onPress={() => setHasSenderNote(true)}
                                style={globalStyles.link}
                            >Add Notes To Sender</Text>
                        )}
                    </View>

                    {/* ===== Sender Info ===== */}
                    <View style={globalStyles.inputWrapper}>
                        <Text style={styles.h1}>Request To</Text>
                    </View>

                    {/* ===== Sender name ===== */}
                    <View style={globalStyles.inputWrapper}>
                        <CustomAnimatedInput
                            value={personName}
                            onChangeText={setPersonName}
                            placeholder="Sender Name"
                            button={(
                                <Text
                                    onPress={() => navigation.navigate('MainHomePackageContacts', {setContact: setPersonContact})}
                                    style={globalStyles.link}
                                >
                                    <FontAwesome5 name="search"/>
                                    <Text> Contact</Text>
                                </Text>
                            )}
                            errorText={validateEnabled && validateSenderName(personName)}
                        />
                    </View>

                    {/* ===== Sender Phone ===== */}
                    <View style={globalStyles.inputWrapper}>
                        <PhoneInput
                            value={mobileUnFormatted}
                            onChangeText={setMobileUnFormatted}
                            onChangeFormattedText={setPersonMobile}
                            errorText={validateEnabled && validateSenderPhone(personMobile)}
                        />
                        <Text style={styles.pikAccountAlert}>Phone must be related to a PIK account</Text>
                    </View>
                    <View style={globalStyles.inputWrapper}>
                        {!!person && (
                            <UserInfo user={person} />
                        )}
                        {!!personMobile && personNotFound && (
                            <Text style={[globalStyles.alert, globalStyles.alertWarning]}>
                                Mobile {personMobile} not related to PIK user
                            </Text>
                        )}
                    </View>

                    {/* ===== Delivery location ===== */}
                    <View style={globalStyles.inputWrapper}>
                        <LocationPicker
                            placeholder="Select Delivery Location"
                            value={deliveryAddress}
                            onPress={selectDeliveryLocation}
                            errorText={validateEnabled && validateAddress(pickupAddress)}
                        />
                    </View>

                    {/* ===== Delivery note ===== */}
                    <View style={globalStyles.inputWrapper}>
                        {hasDeliveryNote ? (
                            <CustomAnimatedInput
                                placeholder="Delivery Note"
                                autoFocus={true}
                                value={deliveryNote}
                                onChangeText={setDeliveryNote}
                            />
                        ) : (
                            <Text onPress={() => setHasDeliveryNote(true)} style={globalStyles.link}>Add delivery note</Text>
                        )}
                    </View>
                    <ViewCollapsable collapsed={requestPickupLocation!=='Select'}>
                        {/* ===== Price info ===== */}
                        <TouchableOpacity onPress={() => setSeePriceBreakDown(!seePriceBreakDown)}>
                            <View style={[styles.flexRow, {alignItems: 'center'}]}>
                                <Text style={styles.totalPriceTitle}>See Price Breakdown</Text>
                                <Text style={styles.totalPrice}>US$ {priceToFixed(price?.total)}</Text>
                                <View style={globalStyles.arrowRight}/>
                            </View>
                        </TouchableOpacity>
                        <ViewCollapsable collapsed={!seePriceBreakDown}>
                            <View style={styles.priceItem}>
                                <Text style={styles.priceItemTitle}>Distance 2.4km</Text>
                                <Text style={styles.priceItemValue}>US$ {priceToFixed(price?.distance)}</Text>
                            </View>
                            <View style={styles.priceItemSpacer}/>
                            <View style={styles.priceItem}>
                                <Text style={styles.priceItemTitle}>Vehicle Type</Text>
                                <Text style={styles.priceItemValue}>US$ {priceToFixed(price?.vehicleType)}</Text>
                            </View>
                            <View style={styles.priceItemSpacer}/>
                            <View style={styles.priceItem}>
                                <Text style={styles.priceItemTitle}>Tax</Text>
                                <Text style={styles.priceItemValue}>US$ {priceToFixed(price?.tax)}</Text>
                            </View>
                        </ViewCollapsable>
                    </ViewCollapsable>

                    <View style={styles.spacer}/>
                </View>
                <View>
                    <View style={globalStyles.inputWrapper}>
                        <PaymentMethodPicker
                            selected={creditCard}
                            onValueChange={setCreditCard}
                            errorText={validateEnabled && validateCreditCard(creditCard)}
                        />
                    </View>
                    {!!error && <Text style={[globalStyles.alert, globalStyles.alertDanger, {marginBottom: 16}]}>{error}</Text>}
                </View>
            </PageContainerDark>
        </KeyboardAvoidingScreen>
    );
};

const mapStateToProps = state => {
    // let {loaded, loading, list, selected} = state.app.paymentMethods;
    return {
        // paymentMethodLoading: loading,
        // paymentMethodLoaded: loaded,
        // paymentMethods: list,
        // selectedPaymentMethod: selected,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addNewOrderToRedux: newOrder => dispatch(addNewOrderAction(newOrder)),
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    flexRow:{
        flex: 1,
        flexDirection: 'row'
    },
    h1: {
        fontWeight: '900',
        fontSize: 16,
        lineHeight: 24,
    },
    vehicleTypeBtn:{
        backgroundColor: GRAY_LIGHT_EXTRA,
        height: 36,
        borderRadius: 18,
        padding: 6,
    },
    vehicleTypeText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
    },
    pikAccountAlert:{
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 16,
        color: COLOR_NEUTRAL_GRAY,
    },
    totalPriceTitle:{
        color: COLOR_PRIMARY_900,
        flexGrow: 1,
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
    },
    totalPrice: {
        paddingHorizontal: 16,
        fontWeight: '700',
        fontSize: 14,
        lineHeight: 24,
    },
    priceItem:{
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 16,
    },
    priceItemSpacer:{
        height: 1,
        backgroundColor: '#ddd',
    },
    priceItemTitle:{
        flexGrow: 1,
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
    },
    priceItemValue:{
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
    },
    spacer: {
        backgroundColor: GRAY_LIGHT_EXTRA,
        height: 2,
        marginHorizontal: -16,
        marginVertical: 19,
    },
    packagePhoto:{
        height: 64,
        width: 64,
        marginRight: 5,
        marginBottom: 5,
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeRequestPackageScreen);
