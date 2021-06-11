import React, {useState} from 'react';
import {
    StyleSheet,
    ActivityIndicator,
    Text,
} from 'react-native';
import MapView from 'react-native-maps';
import PageContainerDark from '../../../components/PageContainerDark';
import KeyboardAvoidingScreen from '../../../components/KeyboardAvoidingScreen';
import {SvgXml} from 'react-native-svg';
import svgs from '../../../utils/svgs';
import {COLOR_PRIMARY_500} from '../../../utils/constants';
import HeaderPage from '../../../components/HeaderPage';
import BaseModal from '../../../components/BaseModal';
import ProgressModal from '../../../components/ProgressModal';

const HomePackageLocationScreen = ({navigation, route}) => {
    const { order} = route.params;
    const [modalVisible, setModalVisible] = useState(true)

    let [region, setRegion] = useState({
        latitude: parseFloat(order.pickup.address.geometry.location.lat),
        longitude: parseFloat(order.pickup.address.geometry.location.lng),
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
    })

    const navigateToOrderDetail = async () => {
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
                params: {orderId: order._id}
            }
        )
    }

    // let _mapView = null;
    return <KeyboardAvoidingScreen>
        <PageContainerDark
            Header={<HeaderPage title="Requesting" />}
            noScroll
            contentStyle={StyleSheet.absoluteFill}
        >
            <MapView
                style={StyleSheet.absoluteFill}
                initialRegion={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation={true}
                userLocationPriority='low'
                showsMyLocationButton={true}
            >
                <MapView.Marker
                    coordinate={{
                        latitude: parseFloat(order.pickup.address.geometry.location.lat),
                        longitude: parseFloat(order.pickup.address.geometry.location.lng),
                    }}
                >
                    <SvgXml
                        size={32}
                        xml={svgs['map-marker']}
                    />
                </MapView.Marker>
            </MapView>
            <ProgressModal
                title="Searching a Carrier ..."
                visible={true}
                onRequestClose={() => navigateToOrderDetail()}
            />
        </PageContainerDark>
    </KeyboardAvoidingScreen>
}

const styles = StyleSheet.create({
})

export default HomePackageLocationScreen;
