import React, {useEffect, useState} from 'react';
import {StatusBar, AppState} from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import {connect} from 'react-redux'
import messaging from '@react-native-firebase/messaging';
import {
    createStackNavigator,
} from '@react-navigation/stack';

import AuthStack from './authNavigator';
import PersonalDetailStack from './personalDetailNavigator';
import MainStack from './mainNavigator';
import LoadingScreen from '../screens/LoadingScreen';
import {useAuth} from '../utils/auth';
import DriverStatuses from '../../../node-back/src/constants/DriverStatuses';
import {getDeviceInfo} from '../utils/helpers';
import Api from '../utils/api'
import {
    reloadCurrentOrder as reloadCurrentOrderAction,
    setCurrentLocation as setCurrentLocationAction,
    setLocationAvailable,
    setOrderChatList as setOrderChatListAction,
} from '../redux/actions/appActions';
import {
    setAuthUser as setAuthUserAction,
} from '../redux/actions/authActions';
import EventBus, {EVENT_DOCUMENTS_APPROVE, EVENT_DOCUMENTS_RECHECK, EVENT_DOCUMENTS_REJECT} from '../eventBus';
import Geolocation from '@react-native-community/geolocation';
import getCurrentPosition from '../utils/getCurrentPosition';
import {COLOR_PRIMARY_900} from '../utils/constants';
import firestore from '../utils/firestore';

const Nav = createStackNavigator();

async function requestUserNotificationPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
        const fcmToken = await messaging().getToken();
        let deviceInfo = getDeviceInfo()
        Api.Driver.registerDevice({fcmToken, ...deviceInfo})
            .then(async data => {
                if(data.success){
                    console.log('device registered successfully')
                    // await AsyncStorage.setItem('device-info', JSON.stringify({fcmToken, ...deviceInfo}))
                }
                else{
                    console.log(data)
                }
            })
            .catch(console.error)
    }
}

const RootNavigator = ({reloadCurrentOrder, setOrderChatList, ...props}) => {
    let auth = useAuth();

    const needToGetPersonalDetails = () => {
        let {hired, status} = auth.user || {};
        // if (!hired) {
        if (status !== DriverStatuses.Approved) {
            return true;
        }
        return false;
    };

    const bootstrapRoutes = () => {
        if (!auth.initialized) {
            return <Nav.Screen name="AppLoading" component={LoadingScreen}/>;
        } else {
            if (!auth.loggedIn) {
                return <Nav.Screen name="Auth" component={AuthStack}/>;
            } else if (needToGetPersonalDetails()) {
                return <Nav.Screen name="PersonalDetail" component={PersonalDetailStack}/>;
            } else {
                return <Nav.Screen name="Main" component={MainStack}/>;
            }
        }
    };

    React.useEffect(() => {
        if(auth.initialized)
            SplashScreen.hide()
    }, [auth.initialized])


    const handleNotificationAction =remoteMessage  => {
        console.log('notification action', remoteMessage);
        switch (remoteMessage.data.action) {
            case 'suggestion':
            case 'reload_current_job':
                console.log('reloading current job ...')
                reloadCurrentOrder()
                break;
            case 'documents_recheck':
                auth.reloadUserInfo()
                EventBus.emit(EVENT_DOCUMENTS_RECHECK)
                break;
            case 'documents_reject':
                auth.reloadUserInfo()
                EventBus.emit(EVENT_DOCUMENTS_REJECT)
                break;
            case 'documents_approve':
                auth.reloadUserInfo()
                EventBus.emit(EVENT_DOCUMENTS_APPROVE)
                break;
        }
    }

    React.useEffect(() => {
        if(!auth?.loggedIn)
            return
        // initializeFirebase()
        requestUserNotificationPermission()


        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log(
                '======== Notification caused app to open from background state======:',
                remoteMessage.notification,
                JSON.stringify(remoteMessage),
            );
            if(remoteMessage?.data?.action){
                handleNotificationAction(remoteMessage)
            }
        });

        // Check whether an initial notification is available
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log(
                        '======== Notification caused app to open from quit state ======:',
                        remoteMessage,
                    );
                    if(remoteMessage?.data?.action){
                        handleNotificationAction(remoteMessage?.data)
                    }
                }
            });

        const unsubscribe = messaging().onMessage(async remoteMessage => {
            // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
            console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
            if(remoteMessage.data?.action){
                handleNotificationAction(remoteMessage)
            }
        });
        return unsubscribe;
    }, [auth?.loggedIn])

    React.useEffect(() => {
        if(props.locationAvailable) {
            const watchId = Geolocation.watchPosition((result) => {
                // console.log('========== location watch success ===========')
                props.setCurrentLocation(result)
                Api.Driver.updateLocation(result)
                    .then(() => {
                    }).catch(console.error)
            }, error => {
                // console.log('========== location watch error ===========', error)
                switch (error.code) {
                    case 1:
                    case 2:
                        props.setLocationAvailable(false)
                }
            })
            return () => Geolocation.clearWatch(watchId);
        }
    }, [props.locationAvailable])

    React.useEffect(() => {
        const timer = setInterval(() => {
            getCurrentPosition()
                .then(info => {
                    // console.log('GPS On/Off state [On]')
                    if(!props.locationAvailable)
                        props.setLocationAvailable(true)
                })
                .catch(() => {
                    // console.log('GPS On/Off state [Off]')
                    if(props.locationAvailable)
                        props.setLocationAvailable(false)
                })
        }, 5000);
        return () => clearInterval(timer);
    }, [props.locationAvailable])

    const onAppStateChange = nextAppState => {
        if(nextAppState === 'active'){
            reloadCurrentOrder()
        }
    }

    React.useEffect(() => {
        AppState.addEventListener('change', onAppStateChange);
        return () => {
            AppState.removeEventListener('change', onAppStateChange);
        }
    }, [])

    /** Watch Orders chats */
    useEffect(() => {
        console.log(`getting chat rooms of [${auth?.user?.name}] .........`)
        const unsubscribe = firestore()
            .collection('pik_delivery_order_chats')
            .where(`userList.${auth?.user?._id}`, '!=', false)
            .onSnapshot(querySnapshot => {
                const threads = querySnapshot.docs.map(documentSnapshot => {
                    return {
                        id: documentSnapshot.id,
                        ...documentSnapshot.data()
                    }
                })

                console.log(`driver chat list: [${threads.length}] chats`)
                setOrderChatList(threads)
            },error => {
                console.error('firestore error', error)
            })
        return () => unsubscribe()
    }, [auth.user?._id?.toString()])

    useEffect(() => {
        /**
         * this used for reflect auth into the redux
         * in some cases authenticated user needed
         */
        props.setAuthUser(auth.user)
    }, [auth?.user?._id])

    return <React.Fragment>
        <StatusBar barStyle="light-content" backgroundColor={COLOR_PRIMARY_900}/>
        <Nav.Navigator headerMode={'none'}>
            {bootstrapRoutes()}
        </Nav.Navigator>
    </React.Fragment>
}

const mapStateToProps = state => ({
    currentLocation: state.app.location.current,
    locationAvailable: state.app.location.available,
})

const mapDispatchToProps = dispatch => {
    return {
        reloadCurrentOrder: () => dispatch(reloadCurrentOrderAction()),
        setCurrentLocation: currentLocation => dispatch(setCurrentLocationAction(currentLocation)),
        setLocationAvailable: available => dispatch(setLocationAvailable(available)),
        setOrderChatList: chatList => dispatch(setOrderChatListAction(chatList)),
        setAuthUser: user => dispatch(setAuthUserAction(user)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RootNavigator);
// export default AuthNavigator;
