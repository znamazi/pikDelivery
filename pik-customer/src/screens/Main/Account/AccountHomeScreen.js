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
    resetStore as resetStoreAction,
} from '../../../redux/actions';
import globalStyles from '../../../utils/globalStyles';
import Header from '../../../components/HeaderProfile';
import {COLOR_PRIMARY_900, GRADIENT_1, GRADIENT_2} from '../../../utils/constants';
import withAuth from '../../../redux/connectors/withAuth';
import LangSwitch from '../../../components/LangSwitch';
import {useTranslation} from 'react-i18next';

const AccountHomeScreen = ({navigation, setTabBarVisible, authLogout, resetStore}) => {
    let {t} = useTranslation()

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

    const confirmAndLogout = () => {
        Alert.alert(
            'Warning',
            'Are you sure to logout ?',
            [
                {
                    text: 'No',
                    onPress: () => {
                    },
                    style: 'cancel',
                },
                {text: 'Yes', onPress: async () => {
                    await authLogout();
                    resetStore()
                }},
            ],
            {cancelable: true},
        );
    };

    useFocusEffect(() => {
        setTabBarVisible(true)
        return () => {
            setTabBarVisible(false)
        }
    }, [])

    return (
        <KeyboardAvoidingScreen>
            <PageContainerDark
                Header={<Header/>}
            >
                <MenuItem
                    description={t('pages.accountHome.menu.profile.description')}
                    title={t('pages.accountHome.menu.profile.title')}
                    onPress={() => navigation.push('MainProfileEdit')}
                />
                <MenuItem
                    description={t('pages.accountHome.menu.support.description')}
                    title={t('pages.accountHome.menu.support.title')}
                    onPress={() => navigation.push('MainSupportCenter')}
                />
                <MenuItem
                    description={t('pages.accountHome.menu.payment.description')}
                    title={t('pages.accountHome.menu.payment.title')}
                    onPress={() => navigation.push('PaymentMethods')}
                />
                <MenuItem
                    description={t('pages.accountHome.menu.address.description')}
                    title={t('pages.accountHome.menu.address.title')}
                    onPress={() => navigation.push('MyAddresses')}
                />
                {/*<MenuItem*/}
                {/*    description={t('pages.accountHome.menu.settings.description')}*/}
                {/*    title={t('pages.accountHome.menu.settings.title')}*/}
                {/*    onPress={() => {*/}
                {/*    }}*/}
                {/*/>*/}
                <MenuItem
                    description={t('pages.accountHome.menu.about.description')}
                    title={t('pages.accountHome.menu.about.title')}
                    onPress={() => navigation.navigate('AboutUs')}
                />
                <MenuItem
                    description={t('pages.accountHome.menu.share.description')}
                    title={t('pages.accountHome.menu.share.title')}
                    onPress={() => {
                    }}
                />
                {/*<LangSwitch>*/}
                {/*    <MenuItem*/}
                {/*        description={t("langSwitch.current")}*/}
                {/*        title="Language"*/}
                {/*        hasSubMenu={false}*/}
                {/*    />*/}
                {/*</LangSwitch>*/}
                <MenuItem
                    description={t('pages.accountHome.menu.logout.description')}
                    title={t('pages.accountHome.menu.logout.title')}
                    hasSubMenu={false}
                    onPress={() => confirmAndLogout()}
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
    resetStore: () => dispatch(resetStoreAction()),
})

const enhance = compose(
    withAuth,
    connect(null, mapDispatchToProps),
)

export default enhance(AccountHomeScreen);
