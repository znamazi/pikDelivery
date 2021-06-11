import React from 'react';
import {
    StyleSheet,
    View,
    Text,
} from 'react-native';
import {GRAY_LIGHT} from '../../utils/constants';
import ButtonPrimary from '../../components/ButtonPrimary';
import {SvgXml} from 'react-native-svg';
import svgs from '../../utils/svgs';

const UploadSuccessScreen = ({navigation}) => {
    return <View style={styles.container}>
        <View style={{flexGrow: 1}}>
            {/*<SvgUri width={'100%'} source={require('../../assets/images/img-03.svg')} />*/}
            <SvgXml width={'100%'} xml={svgs['review']}/>
            <Text style={styles.title}>Validating Document</Text>
            <Text style={styles.description}>We are reviewing your application.</Text>
            <Text style={styles.description}>If you need help end us an email to support@pikdelivery.com</Text>
        </View>
        {/*<View style={{flexGrow: 0}}>*/}
        {/*    <ButtonPrimary*/}
        {/*        onPress={() => navigation.goBack()}*/}
        {/*        title={'Ok'}*/}
        {/*    />*/}
        {/*</View>*/}
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

export default UploadSuccessScreen;
