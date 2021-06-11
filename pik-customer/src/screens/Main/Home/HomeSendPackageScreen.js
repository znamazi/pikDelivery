import React, {useState, useRef, useEffect} from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import {
    addNewOrder as addNewOrderAction,
} from '../../../redux/actions/appActions';
import {
    StyleSheet,
    TouchableOpacity,
    Image,
    StatusBar,
    View,
    Text,
} from 'react-native';
import Api from '../../../utils/api';
import {
    GRAY_LIGHT_EXTRA,
    COLOR_PRIMARY_900, GRADIENT_2, DEVICE_ANDROID, COLOR_NEUTRAL_GRAY, COLOR_PRIMARY_500,
} from '../../../utils/constants';
import PrimaryButton from '../../../components/ButtonPrimary';
import {SvgXml} from 'react-native-svg';
import svgs from '../../../utils/svgs';
import KeyboardAvoidingScreen from '../../../components/KeyboardAvoidingScreen';
import PageContainerDark from '../../../components/PageContainerDark';
import GradientView from '../../../components/GradientView';
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
import CustomTextInput from '../../../components/CustomTextInput';
import GoogleApi from '../../../utils/googleApi';
import fakeDirection from '../../../../sample-directions-response';
import {chooseImage, takePhoto} from '../../../utils/images';
import ActionSheet from 'react-native-actionsheet';
import phoneNumber from 'react-native-phone-input/lib/phoneNumber';
import {PhoneNumberUtil} from 'google-libphonenumber';
import Avatar from '../../../components/Avatar';
const phoneUtils = PhoneNumberUtil.getInstance();
import {PaymentRequest} from 'react-native-payments';
import {DETAILS, METHOD_DATA} from '../../../payment/index'

import {NavigationActions, StackActions} from 'react-navigation'
import {StackAction, CommonActions, NavigationAction} from '@react-navigation/native'
import UserInfo from '../../../components/UserInfo';
import PriceBreakdown from '../../../components/PriceBreakdown';
import AlertBootstrap from '../../../components/AlertBootstrap';
import BoxShadow from '../../../components/BoxShadow';

const VehicleTypeBtn = ({title, icon, active, onPress}) => {
    const Wrapper = active ? GradientView : View;
    return <TouchableOpacity onPress={onPress} style={{flexGrow: 1}}>
        <Wrapper gradient={GRADIENT_2} style={styles.vehicleTypeBtn}>
            <Text style={[styles.vehicleTypeText, {color: active ? "white" : COLOR_PRIMARY_900}]}>
                <FontAwesome5 name={icon} size={15} color={active ? "white" : COLOR_PRIMARY_900}/>
                <Text> {title}</Text>
            </Text>
        </Wrapper>
    </TouchableOpacity>
}

const navigateToOrderDetail = async (navigation, orderId) => {
    // navigation.goBack();
    // navigation.navigate(
    //     "MainTravels",
    //     {
    //         screen: "MainTravelHome",
    //         params:{
    //             screen: "MainTravelOrderDetail",
    //             params: {orderId}
    //         }
    //     },
    // )
    navigation.popToTop();
    await navigation.navigate(
        "MainTravels",
        {
            screen: "MainTravelHome",
        }
    )
    navigation.navigate(
        "MainTravels",
        {
            screen: "MainTravelOrderDetail",
            params: {orderId}
        }
    )
}

const HomeSendPackageScreen = ({navigation, route, ...props}) => {
    const [inProgress, setInProgress] = useState(false);
    const [error, setError] = useState('');
    const [validateEnabled, setValidateEnabled] = useState(false);
    const [vehicleType, setVehicleType] = useState('Motorcycle')
    const [payer, setPayer] = useState('Me')
    const [pickupAddress, setPickupAddress] = useState(null)
    const [hasPickupNote, setHasPickupNote] = useState(false)
    const [photos, setPhotos] = useState([])
    const [pickupNote, setPickupNote] = useState('')
    const [deliveryAddress, setDeliveryAddress] = useState(null)
    const [requestDeliveryLocation, setRequestDeliveryLocation] = useState('Select')
    const [hasDeliveryNote, setHasDeliveryNote] = useState(false)
    const [deliveryNote, setDeliveryNote] = useState('')
    const [personName, setPersonName] = useState('')
    const [personContact, setPersonContact] = useState(null)
    const [personMobile, setPersonMobile] = useState('')
    const [person, setPerson] = useState(null);
    const [personNotFound, setPersonNotFound] = useState(false);
    const [mobileUnFormatted, setMobileUnFormatted] = useState('')
    const [creditCard, setCreditCard] = useState(null)
    // const {paymentMethods, paymentMethodLoaded, paymentMethodLoading, loadPaymentMethods} = props;
    const [seePriceBreakDown, setSeePriceBreakDown] = useState(false)
    const [direction, setDirection] = useState(null);
    const [price, setPrice] = useState(null);

    const selectPickupLocation = () => {
        navigation.navigate('LocationGet', {setLocation: setPickupAddress, address: pickupAddress})
    }

    const selectDeliveryLocation = () => {
        navigation.navigate('LocationGet', {setLocation: setDeliveryAddress, address: deliveryAddress})
    }

    const imageOptions = {
        // width: 800,
        // height: 800,
        // cropping: true,

        // useFrontCamera: false,
        multiple: true,
        maxFiles: 5,
        minFiles: 1,
        hideBottomControls: true,
    };

    const getPhotoFromLibrary = async () => {
        try {
            const newPhotos = await chooseImage(imageOptions);
            setPhotos([...photos, ...newPhotos]);
            // uploadAvatar(photo)
        } catch (err) {
            console.log('error >> ', err);
        }
    };

    const getPhotoFromCamera = async () => {
        try {
            const newPhotos = await takePhoto(imageOptions);
            setPhotos([...photos, ...newPhotos]);
            // uploadAvatar(photo)
        } catch (err) {
            console.log('error >> ', err);
        }
    };

    useEffect(() => {
        if(personContact) {
            setMobileUnFormatted(clearPhoneNumber(personContact.phoneNumbers[0].number))
            setPersonMobile(clearPhoneNumber(personContact.phoneNumbers[0].number))
            // if(!personName)
            setPersonName(`${personContact.givenName} ${personContact.familyName}`.trim())
        }
    }, [personContact])

    useEffect(() => {
        setPersonNotFound(false)
        setPerson(null);

        if(!personMobile || validateReceiverPhone(personMobile))
            return;

        Api.Customer.getMobileInfo(personMobile)
            .then(({success, message, customer}) => {
                console.log(customer)

                if(success && customer /*&& customer.status==='Registered'*/){
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
            .then(({success, price, direction, message}) => {
                console.log(price)
                if(success) {
                    setPrice(price);
                    setDirection(direction)
                }
            })
    },[vehicleType, pickupAddress, deliveryAddress])

    // ======== Validations =============
    const validateAddress = address => {
        if(!address)
            return "Select location"
    }
    const validateReceiverName = name => {
        if(!name)
            return "Please write receiver name"
    }
    const validateReceiverPhone = phone => {
        if(!phone)
            return "Enter receiver phone"
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
            isRequest: false,
            vehicleType,
            pickupAddress,
            payer: payer === 'Me' ? 'sender' : 'receiver',
            personName,
            personMobile,
            pickupNote,
            ...(requestDeliveryLocation==='Select' ? {
                deliveryAddress,
                deliveryNote,
            } : {}),
            ...(payer==='Me' ? {
                creditCard,
            } : {})
        }

        obj2FormData(data, formBody, '');

        !!photos && photos.map(photo => {
            data.append("photos", {
                name: photo.fileName,
                type: photo.mime,
                uri: DEVICE_ANDROID ? photo.uri : photo.uri.replace("file://", "")
            });
        })

        return data;
    }

    const placeOrder = () => {
        setError('');

        let errors = [
            validateAddress(pickupAddress),
            validateReceiverName(personName),
            validateReceiverPhone(personMobile),
            ...(payer==="Me" ? [
                requestDeliveryLocation==='Select' ? validateAddress(deliveryAddress) : null,
                validateCreditCard(creditCard),
            ] : []),
        ].filter(_.identity);

        if(errors.length > 0){
            setValidateEnabled(true);
            setError('Some validations failed. check the form data and try again');
            return
        }

        if((payer === 'Receiver' || requestDeliveryLocation === 'Request') && !person){
            setValidateEnabled(true);
            setError(`Receiving PIK user(${personMobile}) not found`);
            return
        }

        let formData = createFormData();

        setInProgress(true);
        Api.Customer.postNewOrder(formData)
            .then(response => {
                console.log("Response", response)
                let {success, message, order} = response
                if(success){
                    props.addNewOrderToRedux(order);
                    // alert('ok')
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
            .then(() => {
                setInProgress(false)
            })
    }

    const deletePhoto = index => {
        let newList = [...photos]
        newList.splice(index, 1)
        setPhotos(newList);
    }
    let photoSheetRef = null

    return (
        <KeyboardAvoidingScreen>
            <PageContainerDark
                contentStyle={{paddingBottom: 0}}
                Header={
                    <HeaderPage
                        title={'Send Package'}
                        color={HeaderPage.Colors.BLACK}
                    />
                }
                footer={(
                    <PrimaryButton
                        style={{borderRadius: 0, width: '100%'}}
                        title="Place Order"
                        inProgress={inProgress}
                        disabled={inProgress}
                        onPress={() => placeOrder()}
                    />
                )}
                footerStyle={{marginHorizontal: -16}}
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
                        <LocationPicker
                            placeholder="Select Pickup Location"
                            value={pickupAddress}
                            onPress={selectPickupLocation}
                            errorText={validateEnabled && validateAddress(pickupAddress)}
                        />
                    </View>

                    {/* ===== Who's paying ===== */}
                    <View style={globalStyles.inputWrapper}>
                        <Text style={styles.h1}>Who's paying?</Text>
                    </View>
                    <View style={globalStyles.inputWrapper}>
                        <RadioInput
                            value={payer}
                            items={['Me', 'Receiver']}
                            onChange={setPayer}
                        />
                    </View>

                    {/* ===== Person name ===== */}
                    <View style={globalStyles.inputWrapper}>
                        <CustomAnimatedInput
                            value={personName}
                            onChangeText={setPersonName}
                            placeholder="Receiver Name"
                            button={(
                                <Text
                                    onPress={() => navigation.navigate('MainHomePackageContacts', {setContact: setPersonContact})}
                                    style={globalStyles.link}
                                ><FontAwesome5 name="search"/> Contact</Text>)}
                            errorText={validateEnabled && validateReceiverName(personName)}
                        />
                    </View>

                    {/* ===== Person Phone ===== */}
                    <View style={globalStyles.inputWrapper}>
                        <PhoneInput
                            value={mobileUnFormatted}
                            onChangeText={setMobileUnFormatted}
                            onChangeFormattedText={setPersonMobile}
                            errorText={validateEnabled && validateReceiverPhone(personMobile)}
                        />
                        {(payer==='Receiver' || requestDeliveryLocation === 'Request') && (
                            <Text style={styles.pikAccountAlert}>Phone must be related to a PIK account</Text>
                        )}
                    </View>
                    {(payer === 'Receiver' || requestDeliveryLocation === 'Request') && (
                        <View style={globalStyles.inputWrapper}>
                            {!!person && (
                                <View>
                                    <Text style={{fontWeight: '600', fontSize: 16, lineHeight: 24, marginVertical: 16}}>Request To</Text>
                                    <UserInfo user={person} />
                                </View>
                            )}
                            {validateEnabled && !!personMobile && personNotFound && (
                                <AlertBootstrap
                                    type="danger"
                                    message={`Mobile number not related to PIK user`}
                                />
                            )}
                        </View>
                    )}

                    {/* ===== Package photos ===== */}
                    <View style={globalStyles.inputWrapper}>
                        <Text style={styles.h1}>Add Pictures</Text>
                    </View>
                    <View style={[globalStyles.inputWrapper, globalStyles.flexRow, {flexWrap: 'wrap', marginHorizontal: -8}]}>
                        {photos.map((p, index) => (
                            <BoxShadow>
                                <View style={styles.imageContainer}>
                                    {/*<Image style={styles.packagePhoto} source={{uri: p.uri}}/>*/}
                                    <Image style={styles.image} source={{uri: p.uri}}/>
                                    <Text onPress={() => deletePhoto(index)} style={styles.removeBtn}>Remove</Text>
                                </View>
                            </BoxShadow>
                        ))}
                        <SvgXml
                            onPress={() => photoSheetRef.show()}
                            style={[styles.uploadBtn, {margin: 8}]}
                            width={64} height={64}
                            xml={svgs['icon-plus-square']}
                        />
                    </View>
                    <ActionSheet
                        testID="PhotoActionSheet"
                        ref={(o) => {
                            photoSheetRef = o;
                        }}
                        title="Select photo"
                        options={['Take Photo', 'Choose From Library', 'cancel']}
                        cancelButtonIndex={2}
                        onPress={(index) => {
                            if (index === 0) {
                                getPhotoFromCamera();
                            } else if (index === 1) {
                                getPhotoFromLibrary();
                            }
                        }}
                    />

                    {/* ===== Pickup Note ===== */}
                    <View style={globalStyles.inputWrapper}>
                        {hasPickupNote ? (
                            <CustomAnimatedInput
                                placeholder="Pickup Note"
                                value={pickupNote}
                                autoFocus
                                onChangeText={setPickupNote}
                            />
                        ) : (
                            <Text onPress={() => setHasPickupNote(true)} style={globalStyles.link}>Add note</Text>
                        )}
                    </View>
                    {payer === 'Me' && (
                        <View>
                            {/* ===== Delivery location ===== */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={styles.h1}>Delivery Location</Text>
                            </View>
                            <View style={globalStyles.inputWrapper}>
                                <RadioInput
                                    value={requestDeliveryLocation}
                                    items={['Select', 'Request']}
                                    onChange={setRequestDeliveryLocation}
                                />
                            </View>
                            <ViewCollapsable collapsed={requestDeliveryLocation!=='Select'}>
                                <View style={globalStyles.inputWrapper}>
                                    <LocationPicker
                                        placeholder="Select Delivery Location"
                                        value={deliveryAddress}
                                        onPress={selectDeliveryLocation}
                                        errorText={validateEnabled && validateAddress(pickupAddress)}
                                    />
                                </View>
                                <View style={globalStyles.inputWrapper}>
                                    {hasDeliveryNote ? (
                                        <CustomAnimatedInput
                                            placeholder="Delivery Note"
                                            value={deliveryNote}
                                            autoFocus
                                            onChangeText={setDeliveryNote}
                                        />
                                    ) : (
                                        <Text onPress={() => setHasDeliveryNote(true)} style={globalStyles.link}>Add note</Text>
                                    )}
                                </View>
                            </ViewCollapsable>

                            {/* ===== Price info ===== */}
                            <TouchableOpacity onPress={() => setSeePriceBreakDown(!seePriceBreakDown)}>
                                <View style={[styles.flexRow, {alignItems: 'center'}]}>
                                    <Text style={styles.totalPriceTitle}>See Price Breakdown</Text>
                                    <Text style={styles.totalPrice}>US$ {priceToFixed(price?.total)}</Text>
                                    <View style={globalStyles.arrowRight}/>
                                </View>
                            </TouchableOpacity>
                            <ViewCollapsable collapsed={!seePriceBreakDown}>
                                <PriceBreakdown price={price} distance={!direction ? null : direction.routes[0].legs[0].distance} />
                            </ViewCollapsable>

                            <View style={styles.spacer}/>
                        </View>
                    )}
                </View>
                <View>
                    {payer==='Me' && <View style={globalStyles.inputWrapper}>
                        <PaymentMethodPicker
                            selected={creditCard}
                            onValueChange={setCreditCard}
                            errorText={validateEnabled && validateCreditCard(creditCard)}
                        />

                        {/*<View style={globalStyles.inputWrapper}>*/}
                        {/*    <PrimaryButton*/}
                        {/*        title="Payment"*/}
                        {/*        onPress={testPayment}*/}
                        {/*    />*/}
                        {/*</View>*/}
                    </View>}
                    {!!error && (
                        <View style={globalStyles.inputWrapper}>
                            <AlertBootstrap
                                type="danger"
                                message={error}
                                onClose={() => setError('')}
                            />
                        </View>
                    )}
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
    spacer: {
        backgroundColor: GRAY_LIGHT_EXTRA,
        height: 2,
        marginHorizontal: -16,
        marginVertical: 19,
    },
    imageContainer:{
        borderRadius: 5,
        overflow: 'hidden',
        margin: 8,
        // marginVertical: 20,
    },

    image: {
        width: 64,
        height: 64,
        borderWidth: 1,
        backgroundColor: "#999",
    },
    removeBtn:{
        backgroundColor: COLOR_PRIMARY_500 + "aa",
        color: 'white',
        position: 'absolute',
        left: 5,
        right: 5,
        bottom: 5,
        lineHeight: 24,
        textAlign: 'center',
        borderRadius: 5
    },
    uploadBtn: {
        width: 80,
        height: 80,
        // marginVertical: 20,
    },
    packagePhoto:{
        height: 64,
        width: 64,
        marginRight: 5,
        marginBottom: 5,
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeSendPackageScreen);
export {
    VehicleTypeBtn,
    navigateToOrderDetail,
};
