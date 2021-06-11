import React from 'react'
import {
    TouchableOpacity,
    StyleSheet,
    View,
    Text
} from 'react-native'
import {COLOR_PRIMARY_500, GRADIENT_2} from '../utils/constants';
import {SvgXml} from 'react-native-svg';
import svgs from '../utils/svgs';
import GradientView from './GradientView';

const MapCenterButton = ({onPress, style}) => {
    return <TouchableOpacity onPress={onPress}>
        <GradientView gradient={GRADIENT_2} style={[styles.container, style]}>
            <SvgXml width={25} height={25} xml={svgs['gps-white']}/>
        </GradientView>
    </TouchableOpacity>
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLOR_PRIMARY_500,
        width: 50, height: 50,
        borderRadius: 25,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        backgroundColor: COLOR_PRIMARY_500,
        color: 'white',
        lineHeight: 50,
        textAlign: 'center',
    },
})

export default MapCenterButton;
