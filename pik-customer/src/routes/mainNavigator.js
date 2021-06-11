import React from 'react';
import {useNavigation} from '@react-navigation/native'
import messaging from '@react-native-firebase/messaging';
import {
    createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {SvgXml} from 'react-native-svg';
import SvgUri from 'react-native-svg-uri';
import svgs from '../utils/svgs';

import HomeStack from '../routes/homeNavigator';
import TravelsStack from '../routes/travelNavigator';
import AccountStack from '../routes/accountNavigator';
import {getAvailables as getAvailablesSelector} from '../redux/selectors';
import {
    reloadOrderInfo as reloadOrderInfoAction,
    loadOrdersList as reloadOrderListAction,
} from '../redux/actions/appActions'
import Toast from 'react-native-toast-message'
import {connect} from 'react-redux';
import {useTranslation} from 'react-i18next';
import ProgressModal from '../components/ProgressModal';

const BottomTab = createBottomTabNavigator();

const MainNavigator = ({availableOrders, tabBarVisible, ...props}) => {
    let {t} = useTranslation()
    const navigation = useNavigation();
    const [initialRoute, setInitialRoute] = React.useState('MainHome');

    const navIcons = {
        MainHome: {
            on: svgs['icon-home-on'],
            off: svgs['icon-home-off'],
        },
        MainTravels: {
            on: svgs['icon-travel-on'],
            off: svgs['icon-travel-off'],
        },
        MainAccount: {
            on: svgs['icon-user-on'],
            off: svgs['icon-user-off'],
        },

    };
    const screenOptions = ({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
            if (navIcons[route.name]) {
                let iconSource = navIcons[route.name][focused ? 'on' : 'off'];
                // return <SvgUri width={size} height={size} source={iconSource} />
                return <SvgXml width={24} height={24} xml={iconSource}/>;
            } else {
                return <Ionicons name={'ios-information-circle'} size={size} color={color}/>;
            }
        },
    });

    const tabBarOptions = {
        activeTintColor: 'black',
        inactiveTintColor: 'gray',
        style: {height: 49},
        labelStyle: {
            fontWeight: '600',
            fontSize: 12,
            paddingBottom: 5,
        },
    };

    const navigationOptions = ({ navigation }) => {
        // let tabBarVisible = false;
        // if (navigation.state.routes.length > 1) {
        //     navigation.state.routes.map(route => {
        //         if (route.routeName === "LocationGet") {
        //             tabBarVisible = false;
        //         }
        //     });
        // }
        console.log(`======= NavigationOptions ======`)

        return {
            // tabBarVisible,
            tabBarOnPress: (tab, jumpToIndex) => {
                console.log('tabBarOnPress', tab.route)
                if(!tab.focused){
                    jumpToIndex(tab.index);
                }
            },
        };
    }
    const getTabBarVisible = (navigation, route) => {
        const routeName = route.state
            ?  route.state.routes[route.state.index].name
            : route.params?.screen || route.name;

        let visibleScreens = [
            'MainHome',
            'MainTravels',
            'MainHomeMain',
            'MainTravelHome',

            'MainAccount',
            'MainAccountHome',
            'MainProfileEdit'
        ];

        console.log('routeName', routeName)
        if (visibleScreens.includes(routeName)) {
            return true;
        }
        return false;
    }

    const navigateToOrderDetail = async (navigation, orderId) => {
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

    const navigateToGetPackage = async (navigation, orderId) => {
        navigation.popToTop();
        await navigation.navigate(
            "MainHome",
            {
                screen: "MainHomeMain",
            }
        )
        navigation.navigate(
            "MainHome",
            {
                screen: "MainHomeGetPackage",
                params: {orderId}
            }
        )
    }

    const navigateToCompleteOrder = async (navigation, orderId) => {
        navigation.popToTop();
        await navigation.navigate(
            "MainHome",
            {
                screen: "MainHomeMain",
            }
        )
        navigation.navigate(
            "MainHome",
            {
                screen: "MainHomePendingPackage",
                params: {orderId}
            }
        )
    }

    const processNotificationClick = remoteMessage => {
        if(remoteMessage?.data?.action === 'get_package'){
            if(remoteMessage?.data?.order){
                navigateToGetPackage(navigation, remoteMessage.data.order)
            }
        }
        else if(remoteMessage?.data?.action === 'complete_order'){
            if(remoteMessage?.data?.order){
                navigateToCompleteOrder(navigation, remoteMessage.data.order)
            }
        }
        else if(remoteMessage?.data?.order){
            navigateToOrderDetail(navigation, remoteMessage.data.order)
        }
    }

    React.useEffect(() => {
        messaging().onNotificationOpenedApp(remoteMessage => {
            console.log(
                'Notification caused app to open from background state:',
                remoteMessage.notification,
            );
            processNotificationClick(remoteMessage)
            // navigation.navigate(remoteMessage.data.type);
        });

        // Check whether an initial notification is available
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log(
                        'Notification caused app to open from quit state:',
                        remoteMessage,
                        remoteMessage,
                    );
                    // setInitialRoute(remoteMessage.data.type); // e.g. "Settings"
                    processNotificationClick(remoteMessage)
                }
                // setLoading(false);
            });


        const unsubscribe = messaging().onMessage(async remoteMessage => {
            let {notification} = remoteMessage
            console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));

            Toast.show({
                type: 'info', //'success | error | info',
                position: 'top', //'top | bottom',
                text1: notification.title,
                text2: notification.body,
                visibilityTime: 15000,
                autoHide: true,
                topOffset: 30,
            })

            if(remoteMessage?.data?.action === 'reload_orders'){
                props.reloadOrderList();
            }
            else if(['get_package', 'complete_order'].includes(remoteMessage?.data?.action)){
                props.reloadOrderList();
            }
            else if(remoteMessage?.data?.order){
                navigateToOrderDetail(navigation, remoteMessage.data.order)
            }

            if(remoteMessage?.data?.order){
                props.reloadOrderInfo(remoteMessage.data.order)
            }
        });
        return unsubscribe;
    }, [])

    return <BottomTab.Navigator
        screenOptions={screenOptions}
        tabBarOptions={tabBarOptions}
        headerMode={'none'}
        initialRouteName={initialRoute}
        navigationOptions={navigationOptions}
        // initialRouteName="MainAccount"
        // backBehavior="none"
    >
        <BottomTab.Screen
            name="MainHome"
            // options={{
            //     title: 'Home',
            //     ...(availableOrders.count>0 ? {tabBarBadge: availableOrders.count} : {}),
            // }}
            options={({ navigation, route }) => ({
                    title: t('bottomMenu.home'),
                    ...(availableOrders.count>0 ? {tabBarBadge: availableOrders.count} : {}),
                    tabBarVisible: getTabBarVisible(navigation, route) }
            )}
            component={HomeStack}
        />
        <BottomTab.Screen
            name="MainTravels"
            // options={{title: 'Travels'}}
            options={({ navigation, route }) => ({
                    title: t('bottomMenu.travels'),
                    tabBarVisible: getTabBarVisible(navigation, route)
            })}
            component={TravelsStack}
            // listeners={({navigation, route}) => ({
            //     tabPress: e => {
            //         if(navigation.isFocused) {
            //             navigation.popToTop();
            //             navigation.replace('MainTravelHome')
            //         }
            //     },
            // })}
        />

        <BottomTab.Screen
            name="MainAccount"
            // options={{title: 'Me'}}
            options={({ navigation, route }) => ({
                    title: t('bottomMenu.me'),
                    tabBarVisible: getTabBarVisible(navigation, route) }
            )}
            component={AccountStack}
        />

        {/*<Tab.Screen */}
        {/*    name={`DeviceNavigatorTab`} */}
        {/*    component={DeviceNavigator} */}
        {/*    options={{*/}
        {/*        tabBarIcon: ({tintColor}) => <Image source={require('../../images/feather_home-menu.png')} style={{width: 26, height: 26, tintColor}}/>,*/}
        {/*    }} */}
        {/*    listeners={({ navigation, route }) => ({*/}
        {/*        tabPress: e => {*/}
        {/*            if (route.state && route.state.routeNames.length > 0) {*/}
        {/*                navigation.navigate('Device')*/}
        {/*            }*/}
        {/*        },*/}
        {/*    })}*/}
        {/*/>*/}
    </BottomTab.Navigator>;
};

const mapStateToProps = state => {
    return {
        tabBarVisible: state.appearance.tabBarVisible,
        availableOrders: getAvailablesSelector(state),
    }
}

const mapDispatchToProps = dispatch => {
    return {
        reloadOrderInfo: orderId => dispatch(reloadOrderInfoAction(orderId)),
        reloadOrderList: () => dispatch(reloadOrderListAction()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainNavigator);
