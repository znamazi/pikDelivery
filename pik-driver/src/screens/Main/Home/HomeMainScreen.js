import React, {useState, useRef, useEffect, useMemo} from 'react';
import {connect} from 'react-redux'
import getCurrentPosition from '../../../utils/getCurrentPosition';
import {
    StyleSheet,
    Alert,
    View,
    Text,
} from 'react-native';
import MapView from 'react-native-maps';
import {useAuth} from '../../../utils/auth';
import OnlineOfflineBtn from '../../../components/OnlineOfflineBtn';
import BottomDrawer from '../../../components/BottomDrawer';
import SubmenuPending from '../../../components/Submenu/SubmenuPending';
import Api from '../../../utils/api';
import globalStyles from '../../../utils/styles';
import {OrderStatuses, DriverStatuses, GRADIENT_2, WINDOW_HEIGHT} from '../../../utils/constants';
import SubmenuProgress from '../../../components/Submenu/SubmenuProgress';
import {SvgXml} from 'react-native-svg';
import svgs from '../../../utils/svgs';
import useAsyncStorage from '../../../utils/useAsyncStorage';
import SubmenuReturn from '../../../components/Submenu/SubmenuReturn';
import {
    setCurrentOrder as setCurrentOrderAction,
    reloadCurrentOrder as reloadCurrentOrderAction,
} from '../../../redux/actions/appActions'
import MapDirection from '../../../components/MapDirection';
import ButtonPrimary from '../../../components/ButtonPrimary';
import BoxShadow from '../../../components/BoxShadow';
import GradientView from '../../../components/GradientView';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MapDirectionInfo from '../../../components/MapDirectionInfo';
import NavigationButton from '../../../components/NavigationButton';
import openNavigation from '../../../utils/openNavigation';
import GestureRecognizer from '../../../components/GestureRecognizer';
import MapCenterButton from '../../../components/MapCenterButton';
import ProgressModal from '../../../components/ProgressModal';

const HomeMainScreen = ({navigation, ...props}) => {
    const auth = useAuth();
    // const [order, setOrder] = useState(null);
    const {order, setOrder, reloadCurrentOrder} = props;
    const [submenuCollapsed, setSubmenuCollapsed] = useState(false)
    const [mapView, setMapView] = useState(null)
    const {currentLocation, locationAvailable} = props
    const [pickupDirection, setPickupDirection] = useState(null)
    const [deliveryDirection, setDeliveryDirection] = useState(null)
    const [returnDirection, setReturnDirection] = useState(null)
    const [directionInfo, setDirectionInfo] = useState(null)
    const [ignoreList, setIgnoreList] = useAsyncStorage('job-ignore-list', useState({}))
    const [cancelInProgress, setCancelInProgress] = useState(false)
    let [region, setRegion] = useState({
        latitude: 8.985936,
        longitude: -79.518217,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
    })

    const onAssignDriver = () => {
        Api.Driver.assignDriver(order._id)
            .then(({success, order, message}) => {
                if(success){
                    setSubmenuCollapsed(true)
                    setOrder(order);
                }
                else{
                    Alert.alert("Attention", message || 'Somethings went wrong');
                }
            })
    }

    const onPickupArrive = () => {
        if(order.senderModel === 'Business'){
            navigation.navigate('MainHomePickup')
        }
        else{
            Api.Driver.setPickupArrived(order._id)
                .then(({success, order, message}) => {
                    if(success){
                        setOrder(order);
                    }
                    else{
                        Alert.alert("Error", message || 'Somethings went wrong');
                    }
                })
        }
    }

    const onPickupComplete = () => {
        if(order.senderModel === 'business'){
            navigation.navigate('MainHomePickup', {order, setOrder})
        }
        else{
            Api.Driver.setPickupComplete(order._id)
                .then(({success, order, message}) => {
                    if(success){
                        setOrder(order);
                    }
                    else{
                        Alert.alert("Error", message || 'Somethings went wrong');
                    }
                })
        }
    }

    const onDeliveryArrive = () => {
        if(order.senderModel === 'Business'){
            navigation.navigate('MainHomePickup')
        }
        else{
            Api.Driver.setDeliveryArrived(order._id)
                .then(({success, order, message}) => {
                    if(success){
                        setOrder(order);
                    }
                    else{
                        Alert.alert("Error", message || 'Somethings went wrong');
                    }
                })
        }
    }

    const onDeliveryComplete = () => {
        navigation.navigate('MainCompleteDelivery', {order, setOrder})
    }

    const onReturnComplete = () => {
        navigation.navigate('MainCompleteDelivery', {order, setOrder, isReturn: true})
    }

    const onOrderCancel = (customerNoShow, cancelingReason) => {
        setCancelInProgress(true)
        Api.Driver.cancelOrder(order._id, customerNoShow, cancelingReason)
            .then(({success, order: newOrder, message}) => {
                if(success){
                    if(newOrder.status === "Returned"){
                        setOrder(newOrder)
                    }
                    else{
                        Alert.alert("Success", "Delivery has been canceled by you.")
                        setOrder(null);
                    }
                }
                else{
                    Alert.alert("Error", message || 'Somethings went wrong');
                }
            })
            .catch(() => {})
            .then(() => {
                setCancelInProgress(false)
            })
    }

    const onSuggestIgnore = () => {
        // addToIgnoreList(order._id)
        // setOrder(null);
        Api.Driver.ignoreSuggest(order._id)
            .then(({success, message}) => {
                if(success){
                    setOrder(null);
                }
                else{
                    Alert.alert("Error", message || 'Somethings went wrong');
                }
            })
    }

    const renderOrderSubmenu = () => {
        if (!order) {
            return null;
        }
        if (order.status === OrderStatuses.Pending) {
            return (
                <SubmenuPending
                    onAccept={onAssignDriver}
                    onIgnore={onSuggestIgnore}
                    order={order}
                    collapsed={submenuCollapsed}
                />
            );
        }
        else if (order.status === OrderStatuses.Progress) {
            return (
                <SubmenuProgress
                    order={order}
                    onPickupArrive={onPickupArrive}
                    onPickupComplete={onPickupComplete}
                    onDeliveryArrive={onDeliveryArrive}
                    onDeliveryComplete={onDeliveryComplete}
                    onCancel={onOrderCancel}
                    collapsed={submenuCollapsed}
                />
            );
        }
        else if (order.status === OrderStatuses.Returned) {
            return (
                <SubmenuReturn
                    order={order}
                    onReturnComplete={onReturnComplete}
                    collapsed={submenuCollapsed}
                />
            );
        }
        else {
            return null;
        }
    };

    useEffect(() => {
        if(!order?.direction?.routes || !mapView)
            return;
        console.log("direction bounds", JSON.stringify(order.direction.routes[0].bounds))
        let {northeast: ne, southwest:sw} = order.direction.routes[0].bounds;
        let directionRegion = {
            latitude: (ne.lat + sw.lat) / 2,
            longitude: (ne.lng + sw.lng) / 2,
            latitudeDelta: Math.abs(ne.lat - sw.lat) * 1.5,
            longitudeDelta: Math.abs(ne.lng - sw.lng) * 1.5,
        }
        mapView.animateToRegion(directionRegion);
    }, [order, mapView])

    useEffect(() => {
        // if(!auth?.user?.online)
        //     return;
        reloadCurrentOrder()
    }, [auth.user.online, locationAvailable])

    let directionType = useMemo(() => {
        if(
            !order
            || !locationAvailable
            || !currentLocation
            || !['Returned', 'Progress'].includes(order?.status)
        ){
            return '';
        }

        if(order.status === 'Progress'){
            return !order?.time?.pickupComplete ? 'pickup' : 'delivery'
        }
        else{
            return 'return'
        }
    }, [locationAvailable, currentLocation, order?.status])

    useEffect(() => {
        if(!directionType){
            if(!!pickupDirection)
                setPickupDirection(null)
            if(!!deliveryDirection)
                setDeliveryDirection(null)
            if(!!returnDirection)
                setReturnDirection(null)
            return;
        }

        if(directionType === 'pickup'){
            getPickupDirection()
        }
        else if(directionType === 'delivery'){
            getDeliveryDirection()
        }
        else if(directionType === 'return'){
            getReturnDirection()
        }
    }, [directionType])

    function getPickupDirection() {
        if(!!pickupDirection)
            return;
        Api.Driver.getOrderDirection('pickup', order._id, currentLocation)
            .then(({success, direction}) => {
                setPickupDirection(direction)
            })
    }

    function getDeliveryDirection() {
        if(!!deliveryDirection)
            return;
        Api.Driver.getOrderDirection('delivery', order._id, currentLocation)
            .then(({success, direction}) => {
                setDeliveryDirection(direction)
            })
    }

    function getReturnDirection() {
        if(!!returnDirection)
            return;
        Api.Driver.getOrderDirection('pickup', order._id, currentLocation)
            .then(({success, direction}) => {
                setReturnDirection(direction)
            })
    }

    useEffect(() => {
        if(!directionToShow || !directionInfo || !currentLocation)
            return;
        let trackingData = {
            headingTo: directionType,
            timeToArrive: directionInfo.duration.value,
            location: {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            }
        }
        Api.Driver.putOrderTrack(order._id, trackingData)
            .then(({success, message}) => {
                // if(!success)
                    console.log({
                        method: 'PUT_ORDER_TRACK',
                        response: {success, message}
                    })
            })
            .catch(console.error)
    }, [directionToShow, directionInfo])

    const subAlert = useMemo(() => {
        if(!locationAvailable)
            return {style: globalStyles.alertDanger, message: "GPS is Off"}
        if(auth.user.status === DriverStatuses.InReview)
            return {style: globalStyles.alertWarning, message: "Your Documents is in review"}
        if(!auth.user.online)
            return {style: globalStyles.alertWarning, message: "Your status is Offline"}
        return null;
    }, [auth, locationAvailable])

    useEffect(() => {
        if(!mapView)
            return;
        getCurrentPosition()
            .then(info => {
                console.log('user current location', info)
                let userRegion = {
                    latitude: info?.coords?.latitude,
                    longitude: info?.coords?.longitude,
                    latitudeDelta: 0.008,
                    longitudeDelta: 0.008,
                }
                setRegion(userRegion)

                mapView.animateToRegion(userRegion, 100);
            })
            .catch(() => {})
    }, [mapView])

    const startNavigate = (direction) => {
        const data = {
            origin: {
                latitude: direction.routes[0].legs[0].start_location.lat,
                longitude: direction.routes[0].legs[0].start_location.lng
            },
            destination: {
                latitude: direction.routes[0].legs[0].end_location.lat,
                longitude: direction.routes[0].legs[0].end_location.lng
            },
            params: [
                {
                    key: "travelmode",
                    value: "driving"        // may be "walking", "bicycling" or "transit" as well
                },
                {
                    key: "dir_action",
                    value: "navigate"       // this instantly initializes navigation using the given travel mode
                }
            ],
            // waypoints: [
            //     {
            //         latitude: -33.8600025,
            //         longitude: 18.697452
            //     },
            //     {
            //         latitude: -33.8600026,
            //         longitude: 18.697453
            //     },
            //     {
            //         latitude: -33.8600036,
            //         longitude: 18.697493
            //     }
            // ]
        }
        openNavigation(data)
    }

    const directionToShow = useMemo(() => {
        if(![OrderStatuses.Progress, OrderStatuses.Returned].includes(order?.status))
            return null

        if(order?.status === 'Progress'){
            if(!order?.time?.pickupComplete) {
                return pickupDirection
            }
            else{
                return deliveryDirection
            }
        }
        else{
            return returnDirection
        }
    }, [JSON.stringify(order?.time), pickupDirection, deliveryDirection, returnDirection])

    const moveToMyLocation = () => {
        if(!mapView || !locationAvailable || !currentLocation)
            return;

        let userRegion = {
            latitude: currentLocation?.coords?.latitude,
            longitude: currentLocation?.coords?.longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
        }
        setRegion(userRegion)

        mapView.animateToRegion(userRegion, 200);
    }

    return <View styles={styles.container}>
        <MapView
            ref={setMapView}
            style={styles.map}
            initialRegion={region}
            showsUserLocation={false}
            showsMyLocationButton={false}
            zoomControlEnabled={false}
            userLocationPriority={"high"}
            // showsUserLocation={true}
        >
            {(!!order && !directionToShow) && locationAvailable && (
                <MapDirection
                    direction={order?.direction}
                    startMarker={(
                        <SvgXml
                            // onLayout={onMarkerLayout}
                            size={32}
                            xml={svgs['map-marker-home']}
                        />
                    )}
                    endMarker={(
                        <SvgXml
                            // onLayout={onMarkerLayout}
                            size={32}
                            xml={svgs['map-marker-destination']}
                        />
                    )}
                />
            )}
            {!!directionToShow && (
                <MapDirection
                    direction={directionToShow}
                    endMarker={(
                        <SvgXml
                            // onLayout={onMarkerLayout}
                            size={32}
                            xml={svgs[`map-marker-${directionType==='delivery' ? 'destination' : 'home'}`]}
                        />
                    )}
                />
            )}
            {!!currentLocation && locationAvailable && (
                <MapView.Marker
                    coordinate={{
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude,
                    }}
                    anchor={{ x: 0.5, y: 0.5 }}
                >
                    <SvgXml size={32} xml={svgs['map-marker-current-location']} />
                </MapView.Marker>
            )}
        </MapView>
        <View style={styles.toolbar}>
            <View style={{flexGrow: 1}}>
                {(order === null || !auth.user.online) && <OnlineOfflineBtn locationAvailable={locationAvailable} />}
                {(auth.user.online && order != null) && (
                    <React.Fragment>
                        {!!directionToShow && (
                            <MapDirectionInfo
                                // direction={pickupDirection}
                                direction={directionToShow}
                                currentLocation={currentLocation}
                                onInfoChange={info => setDirectionInfo(info)}
                            />
                        )}
                    </React.Fragment>
                )}
                {directionToShow && (
                    <View style={{flexDirection: 'row', paddingTop: 16, justifyContent: 'flex-end'}}>
                        <NavigationButton onPress={() => startNavigate(directionToShow)}/>
                    </View>
                )}
            </View>
            <View>
                <View style={{marginLeft: 'auto'}}>
                    <MapCenterButton onPress={moveToMyLocation}/>
                </View>
            </View>
        </View>
        {(!subAlert && auth.user.online && order != null) && (
            <BottomDrawer
                offset={49}
                onPress={() => setSubmenuCollapsed(!submenuCollapsed)}
            >
                <GestureRecognizer
                    onSwipeUp={() => setSubmenuCollapsed(false)}
                    onSwipeDown={() => setSubmenuCollapsed(true)}
                >
                    {renderOrderSubmenu()}
                </GestureRecognizer>
            </BottomDrawer>
        )}
        {cancelInProgress && (
            <ProgressModal
                title={"Please wait ..."}
            />
        )}
        <View style={styles.alertContainer}>
            {subAlert && <Text style={[globalStyles.alert, subAlert.style]}>{subAlert.message}</Text>}
        </View>
    </View>;
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 40,
    },
    alertContainer: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
    },
    toolbar: {
        position: 'absolute',
        top: 0,
        left: 0,
        padding: 16,
        width: '100%',
        minHeight: WINDOW_HEIGHT * 0.75,
        // borderWidth: 1, borderColor: 'red'
    },
});

const mapStateToProps = state => {
    return {
        order: state.app.currentOrder,
        currentLocation: state.app.location.current,
        locationAvailable: state.app.location.available,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setOrder: order => dispatch(setCurrentOrderAction(order)),
        reloadCurrentOrder: () => dispatch(reloadCurrentOrderAction()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeMainScreen);
