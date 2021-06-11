import React, {useState, useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import FormControl from '../FormControl';
import ButtonPrimary from '../ButtonPrimary';
import {COLOR_PRIMARY_900} from '../../utils/constants';
import ViewCollapsable from '../ViewCollapsable';

const SubmenuReturn = ({
    order,
    onReturnComplete,
    collapsed
}) => {

    const _onReturnComplete = () => {
        onReturnComplete && onReturnComplete()
    }

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.title}>
                    {order.pickup.address.formatted_address}
                </Text>
            </View>

            <ViewCollapsable collapsed={collapsed}>
                <FormControl>
                    <ButtonPrimary
                        title={"Complete Return"}
                        onPress={_onReturnComplete}
                    />
                </FormControl>
            </ViewCollapsable>
        </>
    );
}

const styles = StyleSheet.create({
    title: {
        fontWeight: '400',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        color: COLOR_PRIMARY_900,
        marginVertical: 15,
    },
});

export default SubmenuReturn;
