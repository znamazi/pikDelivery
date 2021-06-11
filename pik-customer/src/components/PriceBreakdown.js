import React from 'react'
import {
    StyleSheet,
    View,
    Text
} from 'react-native'
import {priceToFixed} from '../utils/helpers';

const PriceBreakdown = ({price, distance}) => {
    return <>
        <View style={styles.priceItem}>
            <Text style={styles.priceItemTitle}>Distance {distance?.text}</Text>
            <Text style={styles.priceItemValue}>US$ {priceToFixed(price?.distance)}</Text>
        </View>
        <View style={styles.priceItemSpacer}/>
        <View style={styles.priceItem}>
            <Text style={styles.priceItemTitle}>Vehicle Type</Text>
            <Text style={styles.priceItemValue}>US$ {priceToFixed(price?.vehicleType)}</Text>
        </View>
        {(price?.businessCoverage > 0) && <>
            <View style={styles.priceItemSpacer}/>
            <View style={styles.priceItem}>
                <Text style={styles.priceItemTitle}>Coverage Discount</Text>
                <Text style={styles.priceItemValue}>- US$ {priceToFixed(price?.businessCoverage)}</Text>
            </View>
        </>}
        {!!price?.tax && <>
            <View style={styles.priceItemSpacer}/>
            <View style={styles.priceItem}>
                <Text style={styles.priceItemTitle}>Tax</Text>
                <Text style={styles.priceItemValue}>US$ {priceToFixed(price?.tax)}</Text>
            </View>
        </>}
    </>
}

const styles = StyleSheet.create({
    priceItem:{
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 16,
    },
    priceItemSpacer:{
        height: 1,
        backgroundColor: '#ddd',
    },
    priceItemTitle:{
        flexGrow: 1,
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
    },
    priceItemValue:{
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 24,
    },
})

export default PriceBreakdown;
