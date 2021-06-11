import React from 'react';
import {connect} from 'react-redux'
import {
    createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {SvgXml} from 'react-native-svg';
import SvgUri from 'react-native-svg-uri';
import svgs from '../utils/svgs';
import {
    reloadCurrentOrder as reloadCurrentOrderAction,
} from '../redux/actions/appActions';

import HomeStack from '../routes/homeNavigator';
import TravelsStack from '../routes/travelNavigator';
import AccountStack from '../routes/accountNavigator';

const Nav = createBottomTabNavigator();

const MainNavigator = ({reloadCurrentOrder}) => {
    const navIcons = {
        MainHome: {
            // on: require('../assets/images/icon-home-off.svg'),
            // off: require('../assets/images/icon-home-off.svg'),
            on: svgs['icon-home-on'],
            off: svgs['icon-home-off'],
        },
        MainTravels: {
            // on: require('../assets/images/icon-travel-on.svg'),
            // off: require('../assets/images/icon-travel-on.svg'),
            on: svgs['icon-travel-on'],
            off: svgs['icon-travel-off'],
        },
        MainAccount: {
            // on: require('../assets/images/icon-user-off.svg'),
            // off: require('../assets/images/icon-user-off.svg'),
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

    const getTabBarVisible = (navigation, route) => {
        const routeName = route.state
            ?  route.state.routes[route.state.index].name
            : route.params?.screen || route.name;

        console.log('routeName:', routeName)
        let hiddenScreens = [
            'MainManualCode',
            'MainOrderChat',
            'MainCompleteDelivery',
            'MainHomePickup',
            'MainBankAccount',
            'MainSupportCenter',
            'MainSupportCenterCategory',
            'ContactUs',
            'DeliverySuccess',
        ];

        if (hiddenScreens.includes(routeName)) {
            return false;
        }
        return true;
    }

    return <Nav.Navigator
        screenOptions={screenOptions}
        tabBarOptions={tabBarOptions}
        headerMode={'none'}
        initialRouteName="MainHome"
        // initialRouteName="MainAccount"
    >
        <Nav.Screen
            name="MainHome"
            options={({navigation, route}) => ({
                title: 'Home',
                tabBarVisible: getTabBarVisible(navigation, route)
            })}
            component={HomeStack}
        />
        <Nav.Screen
            name="MainTravels"
            options={({navigation, route}) => ({
                title: 'Jobs',
                tabBarVisible: getTabBarVisible(navigation, route)
            })}
            component={TravelsStack}
        />
        <Nav.Screen
            name="MainAccount"
            options={({navigation, route}) => ({
                title: 'Me',
                tabBarVisible: getTabBarVisible(navigation, route)
            })}
            component={AccountStack}
        />
    </Nav.Navigator>;
};

const mapDispatchToProps = dispatch => {
    return {
        reloadCurrentOrder: () => dispatch(reloadCurrentOrderAction()),
    }
}

export default connect(null, mapDispatchToProps)(MainNavigator);
