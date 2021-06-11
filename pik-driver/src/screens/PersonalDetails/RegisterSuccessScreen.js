import React from 'react';
import {
    StyleSheet,
    View,
    Text,
} from 'react-native';
import {GRAY_LIGHT, GRAY_LIGHT_EXTRA} from '../../utils/constants';
import ButtonPrimary from '../../components/ButtonPrimary';
import {useAuth} from '../../utils/auth';
import {SvgXml} from 'react-native-svg';
import SvgUri from 'react-native-svg-uri';
import svgs from '../../utils/svgs';

const RegisterSuccessScreen = ({navigation}) => {
    const auth = useAuth();
    const reloadUser = () => {
        auth.reloadUserInfo()
            .then(() => {
            });
    };

    return <View style={styles.container}>
        <View style={{flexGrow: 1}}>
            {/*<SvgUri width={'100%'} source={require('../../assets/images/img-03.svg')} />*/}
            <SvgXml width={'100%'} xml={svgs['img-03']}/>
            <Text style={styles.title}>Congratulations</Text>
            <Text style={styles.description}>Your application has been accepted.</Text>
            <Text style={styles.description}>Now you kan start working on PIK</Text>
        </View>
        <View style={{flexGrow: 0}}>
            <ButtonPrimary
                onPress={reloadUser}
                title={'Next'}
            />
        </View>
    </View>;
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        flex: 1,
    },
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 40,
        marginBottom: 20,
    },
    description: {
        textAlign: 'center',
        color: GRAY_LIGHT,
        fontSize: 16,
    },
});

export default RegisterSuccessScreen;
