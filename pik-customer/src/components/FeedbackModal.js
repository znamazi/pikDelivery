import React, {useMemo, useState} from 'react';
import {connect} from 'react-redux';
import {
    KeyboardAvoidingView,
    StyleSheet,
    ScrollView,
    View,
    Text,
} from 'react-native';
import BaseModal from './BaseModal';
import Avatar from './Avatar';
import {uploadUrl} from '../utils/helpers';
import ViewCollapsable from './ViewCollapsable';
import {SvgXml} from 'react-native-svg';
import svgs from '../utils/svgs';
import globalStyles from '../utils/globalStyles';
import CustomAnimatedInput from './CustomAnimatedInput';
import PrimaryButton from './ButtonPrimary';
import {COLOR_NEUTRAL_GRAY} from '../utils/constants';
import Api from '../utils/api';
import {updateOrder as updateOrderAction} from '../redux/actions';
import AlertBootstrap from './AlertBootstrap';

const FeedbackModal = ({order, onRequestClose, auth, ...props}) => {
    let [rate, setRate] = useState(0);
    let [comment, setComment] = useState('');
    let [error, setError] = useState('');
    let [inProgress, setInProgress] = useState(false);

    let visible = useMemo(() => {
        console.log('================')
        console.log('=====', auth.user._id, order.receiver._id)
        if(order.status !== 'Delivered')
            return false;
        if(auth?.user?._id === order.receiver._id) {
            return !order.receiverFeedback;
        }
        if(auth?.user?._id === order.sender._id) {
            return !order.senderFeedback;
        }
        return true;
    }, [auth.user, order.senderFeedback, order.receiverFeedback]);

    const registerFeedback = () => {
        setInProgress(true);
        Api.Customer.registerFeedback(order._id, {rate, comment})
            .then(({success, order: newOrder}) => {
                if (success) {
                    setRate(0);
                    setComment(0);
                    props.reduxUpdateOrder(order._id, {
                        senderFeedback: newOrder.senderFeedback,
                        receiverFeedback: newOrder.receiverFeedback
                    });
                } else {
                    setError(message || 'Somethings went wrong');
                }
            })
            .catch(error => {
                setError(error.message || 'Somethings went wrong');
            })
            .then(() => {
                setInProgress(false);
            });
    };

    return <BaseModal
        visible={visible}
        style={{minWidth: 300}}
        onRequestClose={onRequestClose}
    >
        <KeyboardAvoidingView
            behavior="position"
            enabled
        >
            <Text style={styles.feedbackH1}>Thank you for choose PIK</Text>
            <View style={{alignItems: 'center', marginBottom: 24}}>
                <Avatar
                    source={{uri: uploadUrl(order?.driver?.avatar)}}
                    size={78}
                    border={0}
                />
            </View>
            {/*<Text>{JSON.stringify({rate,comment})}</Text>*/}
            <ViewCollapsable collapsed={rate > 0}>
                <Text style={styles.feedbackTitle1}>Your receipt</Text>
                <Text style={styles.feedbackCost}>US$ {(order?.cost?.total || 0).toFixed(2)}</Text>
                <Text style={styles.feedbackTitle2}>Give your review</Text>
                <Text style={styles.feedbackTitle3}>How was your overall experience with {order?.driver?.firstName}?</Text>
            </ViewCollapsable>
            <View style={{alignItems: 'center', paddingTop: 25}}>
                <View style={{flexDirection: 'row'}}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <SvgXml
                            key={i}
                            onPress={() => setRate(i)}
                            style={i < 5 ? {marginRight: 16} : {}}
                            width={36}
                            xml={svgs[rate >= i ? 'icon-star-on' : 'icon-star-off']}
                        />
                    ))}
                </View>
            </View>
            <ViewCollapsable collapsed={rate < 1}>
                <View style={{height: 25}}/>
                <Text style={styles.feedbackTitle1}>Tell us more about it</Text>
                <View style={globalStyles.inputWrapper}>
                    <CustomAnimatedInput
                        placeholder="leave a review"
                        value={comment}
                        onChangeText={setComment}
                    />
                </View>
                {!!error && (
                    <View style={globalStyles.inputWrapper}>
                        <AlertBootstrap
                            type="danger"
                            message={error}
                            onClose={() => setError('')}
                        />
                    </View>
                )}
                <PrimaryButton
                    title="Submit"
                    inProgress={inProgress}
                    disabled={inProgress}
                    onPress={() => registerFeedback()}
                />
            </ViewCollapsable>
        </KeyboardAvoidingView>
    </BaseModal>;
};

const styles = StyleSheet.create({
    feedbackH1: {
        fontWeight: '700',
        fontSize: 18,
        lineHeight: 24,
        marginBottom: 34,
        textAlign: 'center',
    },
    feedbackTitle1: {
        fontWeight: '700',
        fontSize: 18,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 8,
    },
    feedbackCost: {
        fontWeight: '600',
        fontSize: 32,
        lineHeight: 32,
        textAlign: 'center',
        marginBottom: 44,
    },
    feedbackTitle2: {
        fontWeight: '700',
        fontSize: 14,
        lineHeight: 24,
        textAlign: 'center',
        color: COLOR_NEUTRAL_GRAY,
    },
    feedbackTitle3: {
        fontWeight: '700',
        fontSize: 18,
        lineHeight: 24,
        textAlign: 'center',
    },
});

const mapStateToProps = state => ({
    auth: state.auth
})

const mapDispatchToProps = dispatch => ({
    reduxUpdateOrder: (orderId, update) => dispatch(updateOrderAction(orderId, update)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackModal);
