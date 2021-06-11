import React, {useEffect, useState, useMemo} from 'react';
import {
    StyleSheet,
    Animated,
    TouchableOpacity,
    View,
    Text,
} from 'react-native';
import Avatar from './Avatar';
import {COLOR_NEUTRAL_GRAY, COLOR_PRIMARY_500, COLOR_PRIMARY_900} from '../utils/constants';
import BoxShadow from './BoxShadow';
import {SvgXml} from 'react-native-svg';
import svgs from '../utils/svgs';
import PrimaryButton from './ButtonPrimary';
import ViewCollapsable from './ViewCollapsable';
import globalStyles from '../utils/globalStyles';

const AvailableOrderItem = ({style, order, onGetPackages}) => {
    const [collapsed, setCollapsed] = useState(true);

    const toggleCollapse = () => setCollapsed(!collapsed);

    let computed = useMemo(() => {
        let {isRequest, sender, receiver} = order;
        let isAvailable = order.senderModel === 'business';
        let owner = isAvailable
            ?
            sender.name
            :
            (
                isRequest
                    ?
                    `${receiver.firstName} ${receiver.lastName}`.trim()
                    :
                    `${sender.firstName} ${sender.lastName}`.trim()
            )
        let address = isRequest ? order.delivery?.address?.formatted_address : order.pickup?.address?.formatted_address;
        let requestType = '';
        if(!isAvailable){
            requestType = isRequest ? 'Send Request' : "Address Request"
        }
        return {
            isAvailable,
            isRequest,
            owner,
            address,
            requestType,
        }
    }, [order])

    const onUserClick = () => {
        if(computed.isAvailable)
            toggleCollapse()
        else
            onGetPackages && onGetPackages()
    }

    return (
        <BoxShadow>
            <View style={{...style, ...styles.container}}>
                <TouchableOpacity onPress={onUserClick}>
                    <View>
                        <View style={styles.userInfoContainer}>
                            <Avatar
                                source={{uri: order.senderModel==='business' ? order.sender.logo : order.sender.avatar}}
                                border={1}
                                style={styles.avatar}
                                size={32}
                            />
                            <View style={{flexGrow: 1}}>
                                <View style={[globalStyles.flexRowCenter, {justifyContent: 'space-between'}]}>
                                    <Text style={styles.name}>{computed.owner}</Text>
                                    <Text style={styles.pendingTitle}>{computed.requestType}</Text>
                                </View>
                                <View style={globalStyles.flexRow}>
                                    <View style={globalStyles.flexColumn}>
                                        <Text
                                            style={styles.description}
                                            numberOfLines={1}
                                        >
                                            {computed.isAvailable ? `${order?.packages?.length} Packages` : computed.address}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {computed.isAvailable && <View style={styles.icon}/>}
                        </View>
                    </View>
                </TouchableOpacity>
                {computed.isAvailable && (
                    <ViewCollapsable collapsed={collapsed}>
                        <View style={{padding: 16, paddingBottom: 24}}>
                            {order.packages.map((item, index) => (
                                <View key={index}>
                                    <View style={{height: 24, marginBottom: 8}}>
                                        <View style={styles.flexRow}>
                                            <SvgXml style={styles.itemIcon} width={12} xml={svgs['icon-document']}/>
                                            <Text style={styles.itemName}>{item.description}</Text>
                                        </View>
                                    </View>
                                    <View style={{height: 24, marginBottom: 24}}>
                                        <View style={styles.flexRow}>
                                            <SvgXml style={styles.itemIcon} width={12} xml={svgs['icon-barcode']}/>
                                            <Text style={styles.itemBarcode}>{item.trackingCode}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                            <PrimaryButton title="GET PACKAGES" onPress={onGetPackages}/>
                        </View>
                    </ViewCollapsable>
                )}
            </View>
        </BoxShadow>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 5,
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    userInfoContainer: {
        position: 'relative',
        paddingVertical: 20,
        paddingHorizontal: 16,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        marginRight: 10,
    },
    name: {
        fontWeight: '700',
        fontSize: 16,
        lineHeight: 24,
        color: COLOR_PRIMARY_900,
    },
    pendingTitle: {
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
        color: COLOR_PRIMARY_500,
    },
    description: {
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 16,
        color: COLOR_NEUTRAL_GRAY,
    },
    icon: {
        flexGrow: 0,
        width: 0,
        height: 0,
        marginTop: 8,
        borderWidth: 8,
        borderTopColor: COLOR_PRIMARY_900,
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: 'transparent',
    },
    itemName: {
        fontWeight: '400',
        fontSize: 16,
        lineHeight: 24,
        color: COLOR_PRIMARY_900,
    },
    itemBarcode: {
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 24,
        color: COLOR_NEUTRAL_GRAY,
    },
    itemIcon: {
        marginVertical: 'auto',
        marginRight: 18,
    },
    flexRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default AvailableOrderItem;
