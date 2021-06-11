import React from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux'
import {useFocusEffect} from '@react-navigation/native';
import {
    StyleSheet,
    TouchableOpacity,
    Alert,
    View,
    Text,
} from 'react-native';
import KeyboardAvoidingScreen from '../../../components/KeyboardAvoidingScreen';
import PageContainerDark from '../../../components/PageContainerDark';
import {
    setTabBarVisible as setTabBarVisibleAction,
} from '../../../redux/actions';
import globalStyles from '../../../utils/globalStyles';
import Header from '../../../components/HeaderPage';
import {COLOR_PRIMARY_900, GRADIENT_1, GRADIENT_2} from '../../../utils/constants';
import withAuth from '../../../redux/connectors/withAuth';

const AboutPikScreen = ({navigation, setTabBarVisible, authLogout}) => {

    const MenuItem = ({title, description, onPress, hasSubMenu = true}) => {
        let Wrapper = !!onPress ? TouchableOpacity : View
        return (
            <Wrapper onPress={onPress}>
                <View style={styles.menuContainer}>
                    <Text style={[globalStyles.textCaption1]}>{description}</Text>
                    <Text style={styles.menuTitle}>{title}</Text>
                    {hasSubMenu && <View style={styles.menuIcon}/>}
                </View>
            </Wrapper>
        );
    };

    // useFocusEffect(() => {
    //     setTabBarVisible(true)
    //     return () => {
    //         setTabBarVisible(false)
    //     }
    // }, [])

    return (
        <KeyboardAvoidingScreen>
            <PageContainerDark
                Header={<Header title="About PIK"/>}
            >
                <MenuItem
                    description="About PIK Delivery"
                    title="About Us"
                    onPress={() => navigation.push('CustomBackendPage', {pageTitle: 'About PIK'})}
                />
                <MenuItem
                    description="Legal Terms"
                    title="Legal 1"
                    onPress={() => navigation.push('CustomBackendPage', {pageTitle: 'Legal'})}
                />
                <MenuItem
                    description="Legal Terms"
                    title="Legal 2"
                    onPress={() => navigation.push('CustomBackendPage', {pageTitle: 'Legal 2'})}
                />
                <MenuItem
                    description="Need To Tell Something?"
                    title="Contact Us"
                    onPress={() => navigation.push('ContactUs')}
                />
            </PageContainerDark>
        </KeyboardAvoidingScreen>
    );
};

const styles = StyleSheet.create({
    container: {},
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 40,
    },
    inputWrapper: {
        marginBottom: 15,
    },
    menuContainer: {
        paddingVertical: 10,
    },
    menuDescription: {},
    menuTitle: {
        fontWeight: '400',
        fontSize: 16,
        lineHeight: 24,
        color: COLOR_PRIMARY_900,
    },
    menuIcon: {
        position: 'absolute',
        width: 0,
        height: 0,
        right: 0,
        top: '50%',
        borderWidth: 5,
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: COLOR_PRIMARY_900,
    },
});

const mapDispatchToProps = dispatch => ({
    setTabBarVisible: visible => dispatch(setTabBarVisibleAction(visible)),
})

const enhance = compose(
    withAuth,
    connect(null, mapDispatchToProps),
)

export default enhance(AboutPikScreen);
