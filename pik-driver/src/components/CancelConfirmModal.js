import React from 'react'
import {
    TouchableOpacity,
    TouchableWithoutFeedback,
    SafeAreaView,
    StyleSheet,
    Modal,
    View,
    Text
} from 'react-native'
import FullWidthImage from './FullWidthImage';
import {SvgXml} from 'react-native-svg';
import svgs from '../utils/svgs';
import {COLOR_NEUTRAL_GRAY} from '../utils/constants';
import ButtonPrimary from './ButtonPrimary';
import ButtonSecondary from './ButtonSecondary';
import globalStyles from '../utils/globalStyles';

const CancelConfirmModal = ({visible, onRequestClose, onConfirm, isReturn}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onRequestClose}>
            <SafeAreaView style={{flex: 1}}>
                <View style={{
                    backgroundColor: "white",
                    flex: 1,
                    padding: 16,
                }}>
                    <View style={{flexGrow: 1}}>
                        <SvgXml xml={svgs['img-04']}/>
                        <Text style={styles.title}>{isReturn ? "Return" : "Cancel"} Order</Text>
                        <Text style={styles.description}>{isReturn ? "Return" : "Cancel"} order affect your profile.</Text>
                        <Text style={styles.description}>
                            If your account reach 10% cancellation rate
                            your account may be suspended.
                        </Text>
                    </View>
                    <View style={{flexGrow: 0}}>
                        <View style={globalStyles.inputWrapper}>
                            <ButtonPrimary
                                title="Go Back"
                                onPress={() => (onRequestClose && onRequestClose())}
                            />
                        </View>
                        <ButtonSecondary
                            title={"Yes, " + isReturn ? "Start Return" : "Cancel Order"}
                            onPress={() => (onConfirm && onConfirm())}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    title: {
        fontWeight: '700',
        fontSize: 24,
        lineHeight: 24,
        textAlign: 'center',
        marginTop: 32,
        marginBottom: 16,
    },
    description: {
        fontWeight: '400',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        color: COLOR_NEUTRAL_GRAY,
    },
})

export default CancelConfirmModal;
