import React, {useState} from 'react';
import {
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Alert,
    Image,
    View,
    Text,
} from 'react-native';
import DropShadow from 'react-native-drop-shadow';
import {COLOR_NEUTRAL_GRAY, COLOR_PRIMARY_500, COLOR_PRIMARY_900, COLOR_TERTIARY_SUCCESS} from '../utils/constants';
import {useAuth} from '../utils/auth';
import Api from '../utils/api';
import DefaultAvatar from '../assets/images/default-avatar-square.svg';
import {uploadUrl} from '../utils/helpers';
import {SvgXml} from 'react-native-svg';

const OnlineOfflineBtn = ({onChange, locationAvailable}) => {
    let auth = useAuth();
    const [inProgress, setInProgress] = useState(false);

    const toggleStatus = () => {
        let newStatus = !auth.user.online;
        if(!locationAvailable && newStatus){
            Alert.alert('Attention', "Your GPS is off.\nPlease turn it on and try again.")
            return;
        }
        setInProgress(true);
        Api.Driver.updateStatus(newStatus)
            .then(({success, message}) => {
                if (success) {
                    return auth.reloadUserInfo();
                } else {
                    Alert.alert("Warning", message || 'Somethings went wrong');
                    throw {message: message || 'Somethings went wrong'};
                }
            })
            .then(() => {
                onChange && onChange(newStatus);
            })
            .catch(error => {
                console.log(error);
            })
            .then(() => setInProgress(false));
    };

    return (
        <View style={styles.container}>
            <View style={styles.statusBtnContainer}>
                <DropShadow
                    // style={styles.shadow}
                    style={{
                        shadowColor: COLOR_NEUTRAL_GRAY,
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 2,
                        shadowRadius: 2,
                    }}
                >
                    <TouchableOpacity onPress={toggleStatus}>
                        <View
                            style={[styles.avatarContainer, auth.user.online ? {backgroundColor: COLOR_TERTIARY_SUCCESS} : {}]}>
                            {!!auth.user.avatar ? (
                                <Image style={styles.image} source={{uri: uploadUrl(auth.user.avatar)}}/>
                            ) : (
                                <SvgXml xml={DefaultAvatar} style={styles.image} />
                            )}
                        </View>
                    </TouchableOpacity>
                </DropShadow>
                <View style={[styles.status, auth.user.online ? styles.statusOnline : {}]}/>
                {inProgress && <ActivityIndicator size={48} style={styles.activity} color={COLOR_PRIMARY_500}/>}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 48,
        marginBottom: 16,
    },
    statusBtnContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 25,
        borderColor: COLOR_NEUTRAL_GRAY,
        // borderWidth: 3,
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    status: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 6,
        backgroundColor: COLOR_NEUTRAL_GRAY,
        borderWidth: 2,
        borderColor: '#C4C4C4',
    },
    statusOnline: {
        backgroundColor: COLOR_TERTIARY_SUCCESS,
        borderColor: '#8EE58E',
    },
    activity: {
        position: 'absolute',
        alignSelf: 'center',
    },
});

export default OnlineOfflineBtn;
