import React from 'react';
import {
    StyleSheet,
    Text,
} from 'react-native';
import {GRAY_LIGHT} from '../../../utils/constants';
import ButtonPrimary from '../../../components/ButtonPrimary';
import {useAuth} from '../../../utils/auth';
import {SvgXml} from 'react-native-svg';
import svgs from '../../../utils/svgs';
import OrderStatuses from '../../../../../node-back/src/constants/OrderStatuses.js';
import PageContainerLight from '../../../components/PageContainerLight';
import KeyboardAvoidingScreen from '../../../components/KeyboardAvoidingScreen';

const DeliverySuccessScreen = ({navigation, route}) => {
    const auth = useAuth();
    let {order} = route.params || {}

    let earning = React.useMemo(() => {
        switch (order?.status) {
            case OrderStatuses.Delivered:
                return order.cost.deliveryFee
            case OrderStatuses.Canceled:
                return order.cost.cancelFee
            case OrderStatuses.Returned:
                return order.cost.returnFee
            default:
                return '0.00'
        }
    }, [order])

    return (
        <KeyboardAvoidingScreen>
            <PageContainerLight>
                <SvgXml width={'100%'} xml={svgs['img-03']}/>
                <Text style={styles.title}>Thank you {auth.user.name}</Text>
                <Text style={[styles.description, {marginBottom: 48}]}>Another customer is satisfied with your service. Good work</Text>
                <Text style={styles.description}>Earning on this delivery</Text>
                <Text style={styles.earning}>${earning}</Text>
                <ButtonPrimary
                    onPress={() => navigation.goBack()}
                    title={'Done'}
                />
            </PageContainerLight>
        </KeyboardAvoidingScreen>
    );
};

const styles = StyleSheet.create({
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
        marginBottom: 8,
    },
    earning: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 24,
        lineHeight: 24,
        marginBottom: 24,
    },
});

export default DeliverySuccessScreen;
