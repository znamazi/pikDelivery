import React, {useState, useMemo} from 'react'
import moment from 'moment';
import {compose} from 'redux';
import {
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    View,
    Text,
} from 'react-native';
import Share from 'react-native-share';
import KeyboardAvoidingScreen from '../../../components/KeyboardAvoidingScreen';
import PageContainerDark from '../../../components/PageContainerDark';
import HeaderPage from '../../../components/HeaderPage';
import {
    COLOR_NEUTRAL_GRAY, COLOR_PRIMARY_500,
    COLOR_PRIMARY_900, COLOR_TERTIARY_ERROR,
    COLOR_TERTIARY_HYPERLINK,
    COLOR_TERTIARY_SUCCESS,
    GRADIENT_2,
} from '../../../utils/constants';
import globalStyles from '../../../utils/globalStyles';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {connect} from 'react-redux';
import GradientButton from '../../../components/GradientButton';
import {SvgUri, SvgXml} from 'react-native-svg';
import svgs from '../../../utils/svgs';
import AlertBootstrap from '../../../components/AlertBootstrap';
import {
    loadOrdersList as loadOrdersListAction,
    updateOrder as updateOrderAction
} from '../../../redux/actions';
import UserInfo from '../../../components/UserInfo';
import Api from '../../../utils/api'
import BaseModal from '../../../components/BaseModal';
import OrderStatuses from '../../../../../node-back/src/constants/OrderStatuses'
import {callPhoneNumber, generateQrCode, priceToFixed, uploadUrl} from '../../../utils/helpers';
import PrimaryButton from '../../../components/ButtonPrimary';
import DriverInfo from '../../../components/DriverInfo';
import CircleProgress from '../../../components/CircleProgress';
import TextSingleLine from '../../../components/TextSingleLine';
import ButtonSecondary from '../../../components/ButtonSecondary';
import ViewCollapsable from '../../../components/ViewCollapsable';
import FeedbackModal from '../../../components/FeedbackModal';
import PriceBreakdown from '../../../components/PriceBreakdown';
import withAuth from '../../../redux/connectors/withAuth';
import OrderChat from '../../../components/OrderChat';
import Row from '../../../components/Row';
import ProgressModal from '../../../components/ProgressModal';

const PriceSection = ({order}) => {
    let price = order.cost
    let [collapsed, setCollapsed] = useState(true);
    return <>
        <TouchableOpacity onPress={() => setCollapsed(!collapsed)}>
            <View style={[styles.infoRow, {alignItems: 'center', marginTop: 20}]}>
                <View style={{flexGrow: 1}}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoTitle}>See Price Breakdown</Text>
                        <Text style={[styles.infoVal, {fontWeight: '700'}]}>${priceToFixed(price?.total)}</Text>
                    </View>
                    <Text style={styles.infoDescription}>You will be charged when order start</Text>
                </View>
                <View style={[globalStyles.arrowRight, {flexGrow: 0, marginLeft: 16}]} />
            </View>
        </TouchableOpacity>
        <ViewCollapsable collapsed={collapsed}>
            <PriceBreakdown price={price} distance={!order.direction ? null : order.direction.routes[0].legs[0].distance} />
        </ViewCollapsable>
        <View style={styles.infoSpacer}/>
    </>
}

const TravelOrderDetailScreen = ({navigation, route, authUser, ...props}) => {
    let [qrModalVisible, setQrModalVisible] = useState(false)
    let [refreshing, setRefreshing] = useState(false);
    let [cancelModalVisible, setCancelModalVisible] = useState(false);
    let [cancelInProgress, setCancelInProgress] = useState(false)
    let [error, setError] = useState('')
    let [waitingTime, setWaitingTime] = useState(null)
    let [inProgress, setInProgress] = useState(false)
    const {orderId} = route.params;
    const {orders, ordersLoaded, ordersLoading, loadOrdersList} = props;
    const order = useMemo(() => {
        let o = props.orders.find(o => o._id===orderId)
        if(!o)
            loadOrdersList()
        return o;
    }, [orderId, JSON.stringify(orders)])

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadOrdersList()
        setRefreshing(false);
    }, []);

    const orderCanCancel = () => {
        return [
            OrderStatuses.Created,
            OrderStatuses.Scheduled,
            OrderStatuses.Pending,
            OrderStatuses.Reschedule,
        ].includes(order.status);
    }

    const processOrderCancellation = () => {
        setCancelInProgress(true);
        Api.Customer.cancelOrder(orderId)
            .then(({success, message, order: newOrder}) => {
                if (success) {
                    // return auth .reloadUserInfo();
                    props.reduxUpdateOrder(orderId, newOrder)
                } else {
                    setError(message || 'Somethings went wrong');
                }
            })
            .catch(error => {
                setError(error.message || 'Somethings went wrong')
            })
            .then(() => setCancelInProgress(false));
    }

    const cancelOrder = () => {
        if(!orderCanCancel()){
            setError('Order cannot be cancel')
            return;
        }
        setCancelModalVisible();
    }

    const onRescheduleConfirm = () => {
        editOrder({scheduleConfirm: true})
    }

    const editOrderLocation = () => {
        // navigation.navigate('MainTravelEditPackage', {orderId: order._id, edit: 'deliveryAddress'})
        navigation.navigate('LocationGet', {
            address: order?.delivery?.address,
            setLocation: (newAddress => {
                editOrder({deliveryAddress: newAddress})
            }),
        })
    }

    const editOrder = update => {
        setInProgress(true);
        Api.Customer.editOrder(orderId, update)
            .then(response => {
                let {success, message, order} = response
                if(success){
                    props.reduxUpdateOrder(order._id, order);
                }
                else{
                    setError(message || "Somethings went wrong")
                }
            })
            .catch(error => {
                setError(error.message || "Somethings went wrong")
                console.error(JSON.stringify(error, null, 2), Date.now())
            })
            .finally(() => {
                setInProgress(false);
            })
    }

    const computed = useMemo(() => {
        if(!order)
            return {}
        let {isRequest, status, sender, receiver, payer} = order;
        let waitForComplete = (status ==='Created' && (
            (!isRequest && !order.delivery.address)
            ||
            (isRequest && !order.pickup.address)
        ))
        let personToComplete = waitForComplete ? (
            isRequest
                ?
                (sender._id === authUser._id ? "You" : sender.name)
                :
                (receiver._id === authUser._id ? "You" : receiver.name)
        ) : ''

        let nowDate = moment().format('YYYY-MM-DD')
        let after30Minutes = moment().add(30, 'minutes').format('HH:mm')

        let needToSchedule = (
            ['Scheduled', 'Reschedule'].includes(order?.status)
            && !!order?.schedule?.date
            // && nowDate === moment(order.schedule.date).format('YYYY-MM-DD')
            // && after30Minutes > order.schedule.from
            // && after30Minutes < order.schedule.to;
        )
        let needToAcceptSchedule = (
            needToSchedule
            && nowDate === moment(order.schedule.date).format('YYYY-MM-DD')
            && after30Minutes >= order.schedule.from
            && after30Minutes < order.schedule.to
        )
        return {
            waitForComplete,
            personToComplete,
            needToSchedule,
            needToAcceptSchedule,
        }
    }, [order, moment().format('HH:mm')])

    const shareQrCode = () => {
        let qrForShare = generateQrCode(order.confirmationCode, {type: 'png', cellSize: 4})
        let shareImage = {
            title: "PIK Delivery",//string
            message: "Order Delivery Code",//string
            url: qrForShare,
        };
        Share.open(shareImage).catch(err => console.log(err));
    }

    const qrCode = React.useMemo(() => {
        if(order?.confirmationCode) {
            return generateQrCode(order.confirmationCode)
        }
        else{
            return null
        }
    }, [order?.confirmationCode])

    const dropOfWaiting = React.useMemo(() => {
    }, [order?.time?.deliveryArrival])

    React.useEffect(() => {
        let intervalId = setInterval(() => {

            let hasWaitingTime = (
                (authUser._id === order.sender._id && !!order?.time?.pickupArrival && !order?.time?.pickupComplete)
                ||
                (authUser._id === order.receiver._id && !!order?.time?.deliveryArrival && !order?.time?.deliveryComplete)
            )
            if(order?.status === 'Progress' && hasWaitingTime){
                let t1 = moment(order.time.deliveryArrival || order.time.pickupArrival).toDate().getTime()
                let t2 = Date.now();

                let secondsLeft = 600 - Math.floor((t2 - t1) / 1000)
                secondsLeft = Math.max(0, secondsLeft)
                setWaitingTime(
                    Math.floor(secondsLeft/60).toString().padStart(2,'0')+
                    ":"+
                    Math.floor(secondsLeft%60).toString().padStart(2,'0')
                );
            }
            else {
                if(waitingTime !== null)
                    setWaitingTime(null);
            }
        }, 1000);
        return () => clearInterval(intervalId)
    }, [order])

    let isPriceVisible = React.useMemo(() => {
        if(!order || !order.cost)
            return false;
        let userCondition = order?.senderModel === 'business'
            || (order.isRequest && order[order.payer]?._id === authUser._id)
        let orderCondition = ['Created', 'Scheduled', 'Reschedule'].includes(order.status)
        return userCondition && orderCondition
    }, [order])

    const getTitleOne = () => {
        if(order.status === 'Scheduled')
            return `Scheduled for `
                + moment(order.schedule.date).format('dddd Do')
                + moment(order.schedule.from, 'hh:mm').format(' h:mm A')
        return `Driver ${!order.driver?' Not':'' } Assigned`
    }

    const target = useMemo(() => {
        if(order.receiver._id === authUser._id)
            return order.pickup;
        return order.delivery
    }, [order])

    return <KeyboardAvoidingScreen>
        <PageContainerDark
            refreshing={refreshing} onRefresh={onRefresh}
            Header={<HeaderPage title="Order Details" />}
        >
            <View style={{flexGrow: 1}}>
                {!order && <ActivityIndicator size="large" color={COLOR_PRIMARY_500}/>}
                {!!order &&  <View>
                    {computed.waitForComplete && (
                        <View style={globalStyles.inputWrapper}>
                            <AlertBootstrap
                                type='warning'
                                message={`Waiting ${computed.personToComplete} complete the order`}
                            />
                        </View>
                    )}
                    {order.status === 'Canceled' && (
                        <View style={globalStyles.inputWrapper}>
                            <AlertBootstrap
                                type="danger"
                                message={`Request canceled ${moment(order.cancel?.time).format('MMM Do hh:mm a')}`}
                            />
                        </View>
                    )}
                    {/*{order.status === 'Delivered' && (*/}
                    {/*    <AlertBootstrap*/}
                    {/*        type='success'*/}
                    {/*        message={`Delivery Code: ${order.confirmationCode}`}*/}
                    {/*    />*/}
                    {/*)}*/}
                    {!!waitingTime && (
                        <View style={globalStyles.inputWrapper}>
                            <AlertBootstrap
                                type='info'
                                // message={`Driver arrive your place.\nWaiting time: 10:20`}
                                message={<Text>
                                    <Text>{order.driver.name} arrive your place.</Text>
                                    <Text>{"\n"}</Text>
                                    <Text style={{fontWeight: 'bold'}}>Waiting time: {waitingTime}</Text>
                                </Text>}
                            />
                        </View>
                    )}
                    {(order.status === 'Returned') && (
                        <View style={globalStyles.inputWrapper}>
                            <AlertBootstrap
                                type='danger'
                                // message={`Driver arrive your place.\nWaiting time: 10:20`}
                                message={<Text>
                                    <Text>{order.time.returnComplete ? 'Returned' : 'Returning'} to pickup location</Text>
                                </Text>}
                            />
                        </View>
                    )}
                    {(order.status === 'Reschedule') && (
                        <View style={globalStyles.inputWrapper}>
                            <AlertBootstrap
                                type='danger'
                                // message={`Driver arrive your place.\nWaiting time: 10:20`}
                                message={<Text>
                                    <Text>Booking cancelled because was not confirmed Please reschedule</Text>
                                </Text>}
                            />
                        </View>
                    )}
                    {computed?.needToSchedule && (
                        <View style={styles.rescheduleContainer}>
                            {computed?.needToAcceptSchedule && <Text style={styles.rescheduleTitle}>Order will start. Please confirm your location</Text>}
                            <View style={globalStyles.flexRow}>
                                <Text style={styles.rescheduleT1}>Delivery location</Text>
                                <View style={{flexGrow: 1}}/>
                                <Text
                                    onPress={editOrderLocation}
                                    style={styles.rescheduleT2}
                                >Change Location</Text>
                            </View>
                            <TextSingleLine style={styles.rescheduleAddress}>{order?.delivery?.address?.formatted_address}</TextSingleLine>
                            <Row space={16}>
                                <ButtonSecondary
                                    title="Reschedule"
                                    onPress={() => navigation.navigate('MainTravelEditPackage', {orderId: order._id, edit: 'schedule'})}
                                    style={{height: 36}}
                                />
                                {computed?.needToAcceptSchedule && (
                                    <GradientButton
                                        title=" Accept "
                                        style={{height: 36}}
                                        titleStyle={{fontWeight: '700', fontSize: 16, lineHeight: 24}}
                                        gradient={GRADIENT_2}
                                        inProgress={inProgress}
                                        disabled={inProgress}
                                        onPress={onRescheduleConfirm}
                                    />
                                )}
                            </Row>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Text style={styles.infoTitle}>Order ID</Text>
                        <Text style={styles.infoVal}>{order.id}</Text>
                    </View>
                    <View style={styles.infoSpacer}/>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoTitle}>Date</Text>
                        {/*<Text style={styles.infoVal}>Dec 5th, 2020</Text>*/}
                        <Text style={styles.infoVal}>{moment(order.time.confirm || order.createdAt).format('MMM Do, YYYY')}</Text>
                    </View>
                    <View style={styles.infoSpacer}/>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoTitle}>Vehicle Type</Text>
                        <Text style={styles.infoVal}>{order.vehicleType}</Text>
                    </View>
                    {!!order.driver && <>
                        <View style={styles.infoSpacer}/>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoTitle}>{target?.name}</Text>
                            <Text style={styles.infoVal}>{target?.phone}</Text>
                        </View>
                    </>}
                    {(
                        !!qrCode
                        && !!order.time.pickupComplete
                        && !order?.time?.deliveryComplete
                        && !order?.time?.returnComplete
                    ) && <>
                        <View style={styles.infoSpacer}/>
                        <View style={styles.infoRow}>
                            <View style={globalStyles.flexRowCenter}>
                                <TouchableOpacity onPress={() => setQrModalVisible(true)}>
                                    <SvgXml style={{width: 50, height: 50, marginRight: 12}} xml={qrCode} />
                                </TouchableOpacity>
                                <View style={{flexGrow: 1}}>
                                    <View style={globalStyles.flexRow}>
                                        <Text style={styles.qrTitle}>DELIVERY CODE</Text>
                                        <View style={{flexGrow: 1}}/>
                                        <Text
                                            onPress={shareQrCode}
                                            style={globalStyles.link}
                                        >
                                            Share QR Code
                                        </Text>
                                    </View>
                                    <Text style={styles.qrValue}>{order.confirmationCode}</Text>
                                </View>
                            </View>
                        </View>
                    </>}

                    {computed.waitForComplete && (
                        <React.Fragment>
                            <View style={[globalStyles.flexRowCenter, {marginTop: 32, marginBottom: 16,}]}>
                                <Text style={[styles.h1, {flexGrow: 1}]}>Request to</Text>
                                {order.status==='Created' && <ActivityIndicator size="small" color={COLOR_PRIMARY_900} />}
                            </View>
                            <UserInfo user={order.isRequest ? order.sender : order.receiver} />
                        </React.Fragment>
                    )}

                    {!computed.waitForComplete && (
                        <React.Fragment>
                            <View style={styles.progressContainer}>
                                <CircleProgress n={1} completed={!!order.driver} style={{marginRight: 16}}/>
                                <View style={{flexGrow: 1}}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.progressTitle1}>
                                            <Text>Rider Start  </Text>
                                            {!!order.driver ? (
                                                <Text style={{color: COLOR_TERTIARY_SUCCESS}}>Completed</Text>
                                            ) : (
                                                order.status === 'Pending'
                                                    ?
                                                    <Text style={{color: COLOR_PRIMARY_500}}>In Progress</Text>
                                                    :
                                                    null
                                            )}
                                        </Text>
                                        {!!order.time?.driverAssign && <Text style={styles.progressTimeVal}>{moment(order.time.driverAssign).format('h:mm a')}</Text>}
                                    </View>
                                    <Text style={styles.progressTitle2}>{getTitleOne()}</Text>
                                    <Text style={styles.progressTitle3}>
                                        {!!order.driver ? `${order.driver.firstName} ${order.driver.label}` : 'waiting ...'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.progressContainer}>
                                <CircleProgress n={2} completed={!!order.time?.pickupComplete} style={{marginRight: 16}}/>
                                <View style={{flexGrow: 1}}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.progressTitle1}>
                                            <Text>Pickup From  </Text>
                                            {!!order.time?.pickupComplete ? (
                                                <Text style={{color: COLOR_TERTIARY_SUCCESS}}>Completed</Text>
                                            ) : (
                                                !!order.driver
                                                    ?
                                                    <Text style={{color: COLOR_PRIMARY_500}}>In Progress</Text>
                                                    :
                                                    null
                                            )}
                                        </Text>
                                        {!!order.time?.pickupComplete && <Text style={styles.progressTimeVal}>{moment(order.time.pickupComplete).format('h:mm a')}</Text>}
                                    </View>
                                    <View style={styles.infoRow}>
                                        <View style={{flexDirection: 'column', flex: 1}}>
                                            <Text numberOfLines={1} style={styles.progressTitle2}>{order.pickup.address?.formatted_address || 'Waiting for address ...'}</Text>
                                        </View>
                                    </View>
                                    {!!order.pickup.note && (
                                        <View style={styles.infoRow}>
                                            <Text style={styles.progressTitle3}>
                                                <FontAwesome5 name="comment"/>
                                            </Text>
                                            <View style={{flexDirection: 'column', flex: 1, paddingLeft: 8}}>
                                                <Text style={styles.progressTitle3}>{order.pickup.note}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <View style={styles.progressContainer}>
                                <CircleProgress
                                    n={3}
                                    completed={!!order.time?.deliveryComplete || !!order?.time?.returnComplete}
                                    style={{marginRight: 16}}
                                />
                                <View style={{flexGrow: 1}}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.progressTitle1}>
                                            {order.status==='Returned' ? <Text>Return To  </Text> : <Text>Drop Off  </Text>}
                                            {(!!order.time?.deliveryComplete || !!order?.time?.returnComplete) ? (
                                                <Text style={{color: COLOR_TERTIARY_SUCCESS}}>Completed</Text>
                                            ) : (
                                                !!order.time?.pickupComplete
                                                    ?
                                                    <Text style={{color: COLOR_PRIMARY_500}}>In Progress</Text>
                                                    :
                                                    null
                                            )}
                                        </Text>
                                        {(!!order.time?.deliveryComplete || !!order?.time?.returnComplete) && (
                                            <Text style={styles.progressTimeVal}>
                                                {moment(order.time.deliveryComplete || order?.time?.returnComplete).format('h:mm a')}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.infoRow}>
                                        <View style={{flexDirection: 'column', flex: 1}}>
                                            {order?.status === 'Returned' ? (
                                                <Text numberOfLines={1} style={styles.progressTitle2}>
                                                    {order?.pickup?.address?.formatted_address}
                                                </Text>
                                            ) : (
                                                <Text numberOfLines={1} style={styles.progressTitle2}>
                                                    {order?.delivery?.address?.formatted_address || 'Waiting for address ...'}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    {(!!order.delivery.note && order?.status!='Returned') && (
                                        <View style={styles.infoRow}>
                                            <Text style={styles.progressTitle3}>
                                                <FontAwesome5 name="comment"/>
                                            </Text>
                                            <View style={{flexDirection: 'column', flex: 1, paddingLeft: 8}}>
                                                <Text style={styles.progressTitle3}>{order.delivery.note}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </React.Fragment>
                    )}

                    {isPriceVisible && <PriceSection order={order} />}

                    {(order.status === 'Progress' && !!order.driver) && (
                        <React.Fragment>
                            <View style={[styles.infoRow, {alignItems: 'center'}]}>
                                <Text style={styles.h1}>Driver Assigned</Text>
                                    <GradientButton
                                        onPress={() => navigation.navigate("MainTravelOrderTracking", {order})}
                                        style={{height: 32}}
                                        titleStyle={{fontWeight: '400', fontSize: 12, lineHeight: 16}}
                                        gradient={GRADIENT_2}
                                        title="Live Tracking"
                                    />
                            </View>
                            <View style={[styles.infoRow, {alignItems: 'center', paddingVertical: 22}]}>
                                <DriverInfo driver={order.driver} />
                                <TouchableOpacity onPress={() => callPhoneNumber(order.driver.mobile)}>
                                    <SvgXml style={{marginLeft: 28}} width={28} xml={svgs['icon-phone']}/>
                                </TouchableOpacity>
                                <OrderChat
                                    style={{marginLeft: 28}}
                                    order={order}
                                    driver={order.driver}
                                    customer={authUser}
                                />
                            </View>

                            {/*<FeedbackModal order={order} />*/}
                        </React.Fragment>
                    )}
                    {order.time.pickupComplete && (
                        <BaseModal
                            visible={!!qrCode && qrModalVisible}
                        >
                            <View style={{minWidth: 250, alignItems: 'center'}}>
                                {qrCode && <SvgXml style={{width: 150, height: 150}} xml={qrCode} />}
                            </View>
                            <Text style={{textAlign: 'center', fontWeight: '600', fontSize: 24, lineHeight: 32, marginTop: 24}}>
                                {order.confirmationCode}
                            </Text>
                            <Text style={{
                                textAlign: 'center', fontWeight: '400',
                                fontSize: 14, lineHeight: 24, color: COLOR_NEUTRAL_GRAY,
                                marginTop: 8, marginBottom: 32
                            }}>
                                Scan Delivery Code
                            </Text>
                            <PrimaryButton
                                title="Done"
                                onPress={() => setQrModalVisible(false)}
                            />
                        </BaseModal>
                    )}
                </View>}
            </View>
            {!!order && <View>
                {!!error && (
                    <AlertBootstrap
                        type="danger"
                        message={error}
                        onClose={() => setError('')}
                    />
                )}
                {orderCanCancel() && (
                    <React.Fragment>
                        <TouchableOpacity onPress={cancelOrder}>
                            <Text style={styles.cancelBtn}>Cancel Order</Text>
                        </TouchableOpacity>
                        <BaseModal
                            title="Order Cancellation"
                            visible={cancelModalVisible}
                            maxWidth={350}
                            onRequestClose={() => setCancelModalVisible(false)}
                            buttons={[
                                {
                                    title: <Text style={{color: COLOR_PRIMARY_500}}>Go Back</Text>,
                                    onPress: () => setCancelModalVisible(false)
                                },
                                {
                                    title: <Text style={{color: COLOR_NEUTRAL_GRAY}}>Cancel Order</Text>,
                                    onPress: () => {
                                        setCancelModalVisible(false);
                                        processOrderCancellation();
                                    }
                                },
                            ]}
                        >
                            <Text style={{fontWeight: '400', fontSize: 16, lineHeight: 24, textAlign: 'center'}}>
                                {
                                    !!order.driver ?
                                        "If you cancel this order you wil be charged for $2,00 as cancellation fee"
                                        :
                                        "     Are you sure to cancel order?     "
                                }
                            </Text>
                        </BaseModal>
                    </React.Fragment>
                )}
            </View>}
            <ProgressModal
                title="Please Wait ..."
                visible={inProgress}
            />
        </PageContainerDark>
    </KeyboardAvoidingScreen>
}



const styles = StyleSheet.create({
    h1: {
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 24,
        color: COLOR_PRIMARY_900,
    },
    infoRow:{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    infoTitle:{
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
        color: COLOR_PRIMARY_900,
    },
    infoDescription: {
        fontWeight: '400',
        fontSize: 13,
        lineHeight: 16,
        color: COLOR_NEUTRAL_GRAY,
    },
    infoVal: {
        fontWeight: '600',
        fontSize: 14,
        lineHeight: 24,
        color: COLOR_PRIMARY_900,
    },
    infoSpacer: {
        height: 1,
        backgroundColor: '#F0EFEF',
        marginVertical: 16,
    },
    progressContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        maxWidth: '100%',
    },
    progressTimeVal: {
        fontWeight: '500',
        fontSize: 12,
        lineHeight: 16,
        color: COLOR_TERTIARY_HYPERLINK,
    },
    progressTitle1:{
        fontWeight: '700',
        fontSize: 12,
        lineHeight: 16,
        color: COLOR_NEUTRAL_GRAY,
    },
    progressTitle2:{
        fontWeight: '700',
        fontSize: 16,
        lineHeight: 24,
        color: COLOR_PRIMARY_900,
    },
    progressTitle3:{
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 16,
        color: COLOR_NEUTRAL_GRAY,
    },
    cancelBtn: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 16,
        lineHeight: 24,
        marginTop: 16,
        color: COLOR_TERTIARY_ERROR,
    },
    qrTitle:{
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24
    },
    qrValue:{
        fontWeight: '700',
        fontSize: 24,
        lineHeight: 32
    },
    rescheduleContainer:{
        backgroundColor: '#F0EFEF',
        padding: 14,
        borderRadius: 8,
        marginBottom: 16,
    },
    rescheduleTitle:{
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 16,
        marginBottom: 20,
    },
    rescheduleT1:{
        fontWeight: '700',
        fontSize: 12,
        lineHeight: 16,
        color: COLOR_NEUTRAL_GRAY
    },
    rescheduleT2:{
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 16,
        color: COLOR_TERTIARY_HYPERLINK,
    },
    rescheduleAddress:{
        fontWeight: '700',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 26,
    },
})

const mapStateToProps = state => {
    let {orders, ordersLoaded, ordersLoading} = state.app;
    return {orders, ordersLoaded, ordersLoading}
}

const mapDispatchToProps = dispatch => ({
    loadOrdersList: () => dispatch(loadOrdersListAction()),
    reduxUpdateOrder: (orderId, update) => dispatch(updateOrderAction(orderId, update)),
})

const enhance = compose(
    withAuth,
    connect(mapStateToProps, mapDispatchToProps)
)

export default enhance(TravelOrderDetailScreen);
