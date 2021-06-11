import React, {useEffect} from 'react';
import SplashScreen from 'react-native-splash-screen'
import AsyncStorage from '@react-native-community/async-storage'
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import {
    createStackNavigator,
} from '@react-navigation/stack';

import AuthStack from './authNavigator';
import MainStack from './mainNavigator';
import LoadingScreen from '../screens/LoadingScreen';
import DriverStatuses from '../../../node-back/src/constants/DriverStatuses';
import withAuth from '../redux/connectors/withAuth';
import {StatusBar, View, AppState} from 'react-native';
import {BLACK} from '../utils/constants';
import {getDeviceInfo} from '../utils/helpers';
import Api from '../utils/api'
import Toast from 'react-native-toast-message';
import {
    loadOrdersList as loadOrdersListAction,
    setOrderChatList as setOrderChatListAction,
} from '../redux/actions';
import {compose} from 'redux';
import {connect} from 'react-redux';
import firestore from '../utils/firestore';
import {getAvailables as getAvailablesSelector} from '../redux/selectors';

const RootNavigator = createStackNavigator();

async function requestUserNotificationPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
        const fcmToken = await messaging().getToken();
        let deviceInfo = getDeviceInfo()
        Api.Customer.registerDevice({fcmToken, ...deviceInfo})
            .then(async data => {
                if(data.success){
                    console.log('device registered successfully')
                    await AsyncStorage.setItem('device-info', JSON.stringify({fcmToken, ...deviceInfo}))
                }
                else{
                    console.log(data)
                }
            })
            .catch(console.error)

        // let storedInfo = await AsyncStorage.getItem('device-info')
        // try {
        //     storedInfo = JSON.parse(storedInfo);
        // }catch (e) {}
        // if(!storedInfo || !storedInfo.fcmToken || storedInfo.fcmToken !== fcmToken){
        // }
    }
}

const RootNavigatorComponent = ({authInitialized, authLoggedIn, setOrderChatList, authUser, ...props}) => {
    let {ordersLoading, loadOrdersList} = props;

    const bootstrapRoutes = () => {
        if (!authInitialized) {
            return <RootNavigator.Screen name="AppLoading" component={LoadingScreen}/>;
        } else {
            if (!authLoggedIn) {
                return <RootNavigator.Screen name="Auth" component={AuthStack}/>;
            } else {
                return <RootNavigator.Screen name="Main" component={MainStack}/>;
            }
        }
    };

    React.useEffect(() => {
        if(authInitialized)
            SplashScreen.hide()
    }, [authInitialized])

    useEffect(() => {
        // initializeFirebase()
        requestUserNotificationPermission()

    }, [])

    const onAppStateChange = nextAppState => {
        if(nextAppState === 'active'){
            if(!ordersLoading)
                loadOrdersList();
        }
    }

    useEffect(() => {
        AppState.addEventListener('change', onAppStateChange);
        return () => {
            AppState.removeEventListener('change', onAppStateChange);
        }
    }, [])

    const toastConfig = {
    };

    useEffect(() => {
        console.log(`getting chat rooms of [${authUser?.name}] .........`)
        const unsubscribe = firestore()
            .collection('pik_delivery_order_chats')
            .where(`userList.${authUser?._id}`, '!=', false)
            .onSnapshot(querySnapshot => {
                const threads = querySnapshot.docs.map(documentSnapshot => {
                    return {
                        id: documentSnapshot.id,
                        ...documentSnapshot.data()
                    }
                })

                console.log(`customer chat list: [${threads.length}] chats`)
                setOrderChatList(threads)
            },error => {
                console.error('firestore error', error)
            })
        return () => unsubscribe()
    }, [authUser?._id?.toString()])

    return <>
        <StatusBar barStyle="light-content" backgroundColor={BLACK}/>
        <RootNavigator.Navigator headerMode={'none'}>
            {bootstrapRoutes()}
        </RootNavigator.Navigator>
        <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
    </>;
}

const mapStateToProps = state => {
    let {ordersLoaded, ordersLoading} = state.app;
    return {
        ordersLoaded,
        ordersLoading,
    }
}

const mapDispatchToProps = dispatch => ({
    loadOrdersList: () => dispatch(loadOrdersListAction()),
    setOrderChatList: chatList => dispatch(setOrderChatListAction(chatList)),
})

const enhance = compose(
    withAuth,
    connect(mapStateToProps, mapDispatchToProps)
)

export default enhance(RootNavigatorComponent)
