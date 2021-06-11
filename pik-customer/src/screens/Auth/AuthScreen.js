import React from 'react';
import {
    StyleSheet,
    Image,
    View,
    Text, StatusBar,
} from 'react-native';
import {ORANGE, GRAY_LIGHT, GRAY, WINDOW_WIDTH, PAGE_PADDING, GRADIENT_2} from '../../utils/constants';
import ButtonSecondary from '../../components/ButtonSecondary';
import ButtonPrimary from '../../components/ButtonPrimary';
import FullWidthImage from '../../components/FullWidthImage';
import svgs from '../../utils/svgs';
import DevConfigModal from '../../components/DevConfigModal';

const AuthScreen = ({navigation}) => {
    let [devModalVisible, setDevModalVisible] = React.useState(false)
    return (
        <View style={styles.container}>
            <View style={{marginVertical: 10}}>
                <FullWidthImage
                    svg={svgs['img-01']}
                    aspectRatio={2.5}
                />
            </View>
            <View style={{flexGrow: 1}}>
                <Text style={styles.title}>Welcome to PIK Customer</Text>
                <Text style={styles.description}>Lorem ipsum dolor sit amet, consectetur</Text>
                <View style={{marginBottom: 10}}>
                    <ButtonPrimary
                        title="Sign In"
                        onPress={() => navigation.push('AuthLogin')}
                    />
                </View>
                <ButtonSecondary
                    title="REGISTER"
                    onPress={() => navigation.push('AuthRegister')}
                />
            </View>
            <View style={{flexGrow: 0}}>
                <Text onPress={() => setDevModalVisible(true)} style={styles.copyright}>Copyright @ PIK Delivery</Text>
            </View>
            <DevConfigModal
                visible={devModalVisible}
                onRequestClose={() => setDevModalVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: PAGE_PADDING,
        flex: 1,
        backgroundColor: 'white',
    },
    title: {
        marginBottom: 10,
        fontWeight: '700',
        fontSize: 32,
        lineHeight: 48,
        textAlign: 'center',
        color: 'black',
    },
    description: {
        textAlign: 'center',
        color: GRAY_LIGHT,
        marginBottom: 86,
    },
    copyright: {
        fontSize: 12,
        lineHeight: 25,
        color: GRAY,
        textAlign: 'center',
    },
    imageContainer: {
        flexGrow: 0,
        padding: 20,
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // borderWidth: 1,
        // backgroundColor: "gray",
    },
    image: {
        width: '100%',
        // backgroundColor: 'blue',
        flex: 1,
        aspectRatio: 1.4,
    },
});

export default AuthScreen;
