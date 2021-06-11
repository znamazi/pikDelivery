import React, {useState, useRef, useEffect, useMemo} from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import {
    updateOrder as updateOrderAction, loadOrdersList as loadOrdersListAction,
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
import {clearPhoneNumber, obj2FormData} from '../../../utils/helpers';
import {VehicleTypeBtn, navigateToOrderDetail} from './HomeSendPackageScreen';
import UserInfo from '../../../components/UserInfo';
import AlertBootstrap from '../../../components/AlertBootstrap';
import {PhoneNumberUtil} from 'google-libphonenumber';
const phoneUtils = PhoneNumberUtil.getInstance();

const HomePendingPackageScreen = ({navigation, route, ...props}) => {
    const [inProgress, setInProgress] = useState(false);
    const [error, setError] = useState('');
    const [validateEnabled, setValidateEnabled] = useState(false);
    const [address, setAddress] = useState(null)
    const [hasNote, setHasNote] = useState(false)
    const [note, setNote] = useState('')
    const [creditCard, setCreditCard] = useState(null)

    const {orderId} = route.params;
    const {orders, ordersLoaded, ordersLoading, loadOrdersList} = props;
    const order = useMemo(() => {
        let o = props.orders.find(o => o._id===orderId)
        if(!o)
            loadOrdersList()
        return o;
    }, [orderId, JSON.stringify(orders)])

    const selectLocation = () => {
        navigation.navigate('LocationGet', {setLocation: setAddress, address})
    }

    // ======== Validations =============
    const validateAddress = address => {
        if(!address)
            return "Select location"
    }
    const validateCreditCard = cardNumber => {
        if(!cardNumber)
            return "Please select credit card"
    }
    // ==================================

    const createFormData = () => {
        const data = new FormData();

        let formBody = {
            address,
            creditCard,
        }

        obj2FormData(data, formBody, '');

        return data;
    }

    const completeOrder = () => {
        setError('');

        let errors = [
            validateAddress(address),
            !order?.isRequest ? validateCreditCard(creditCard) : null,
        ].filter(_.identity);

        if(errors.length > 0){
            setValidateEnabled(true);
            setError('Some validations failed. check the form data and try again');
            return
        }

        let formData = createFormData();

        setInProgress(true)
        Api.Customer.completeOrder(order._id, formData)
            .then(response => {
                console.log("Response", response)
                let {success, message, order} = response
                if(success){
                    props.reduxUpdateOrder(order._id, order);
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
                setInProgress(false);
            })
    }

    return (
        <KeyboardAvoidingScreen>
            <PageContainerDark
                contentStyle={{paddingBottom: 0}}
                Header={
                    <HeaderPage
                        title={'Pending Package'}
                        color={HeaderPage.Colors.BLACK}
                    />
                }
                footer={(
                    <PrimaryButton
                        style={{marginHorizontal: -16, borderRadius: 0}}
                        title="Complete Order"
                        inProgress={inProgress}
                        disabled={inProgress}
                        onPress={() => completeOrder()}
                    />
                )}
                footerStyle={{marginHorizontal: -16}}
            >
                <View style={{flexGrow: 1}}>
                    <View style={globalStyles.inputWrapper}>
                        <AlertBootstrap
                            type="warning"
                            message="Waiting for complete order"
                            onClose={() => {}}
                        />
                    </View>
                    {!!order?.pickup?.senderNote && (
                        <View style={globalStyles.inputWrapper}>
                            <AlertBootstrap
                                type="info"
                                message={`${order.receiver.name}:\n` + order?.pickup?.senderNote}
                            />
                        </View>
                    )}
                    {/* ===== Location ===== */}
                    <View style={globalStyles.inputWrapper}>
                        <LocationPicker
                            placeholder={`Select ${order?.isRequest ? 'Pickup' : 'Delivery'} Location`}
                            value={address}
                            onPress={selectLocation}
                            errorText={validateEnabled && validateAddress(address)}
                        />
                    </View>

                    {/* ===== Note ===== */}
                    <View style={globalStyles.inputWrapper}>
                        {hasNote ? (
                            <CustomAnimatedInput
                                placeholder={`${order?.isRequest ? 'Pickup' : 'Delivery'} Note`}
                                value={note}
                                onChangeText={setNote}
                            />
                        ) : (
                            <Text onPress={() => setHasNote(true)} style={globalStyles.link}>Add {order?.isRequest ? 'pickup' : 'delivery'} note</Text>
                        )}
                    </View>

                </View>
                <View>
                    <View style={styles.spacer}/>
                    {!order?.isRequest && <View style={globalStyles.inputWrapper}>
                        <PaymentMethodPicker
                            selected={creditCard}
                            onValueChange={setCreditCard}
                            errorText={validateEnabled && validateCreditCard(creditCard)}
                        />
                    </View>}
                    {!!error && <AlertBootstrap
                        type="danger"
                        message={error}
                        onClose={() => setError('')}
                    />}
                </View>
            </PageContainerDark>
        </KeyboardAvoidingScreen>
    );
};

const mapStateToProps = state => {
    let {orders, ordersLoaded, ordersLoading} = state.app;
    return {orders, ordersLoaded, ordersLoading}
}

const mapDispatchToProps = dispatch => {
    return {
        loadOrdersList: () => dispatch(loadOrdersListAction()),
        reduxUpdateOrder: (orderId, update) => dispatch(updateOrderAction(orderId, update)),
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

export default connect(mapStateToProps, mapDispatchToProps)(HomePendingPackageScreen);
