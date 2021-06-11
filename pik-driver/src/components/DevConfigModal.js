import React, {useState} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
    KeyboardAvoidingView,
    StyleSheet,
    View,
    Text,
} from 'react-native';
import BaseModal from './BaseModal';
import globalStyles from '../utils/globalStyles';
import PrimaryButton from './ButtonPrimary';
import {COLOR_NEUTRAL_GRAY} from '../utils/constants';
import CustomAnimatedInput from './CustomAnimatedInput';
import axios from '../utils/axios'
import {useAuth} from '../utils/auth';

const DevConfigModal = ({visible, onRequestClose, ...props}) => {
    const auth = useAuth();
    let [apiBaseUrl, setApiBaseUrl] = useState('https://api.pikdelivery.com');

    const onSave = () => {
        AsyncStorage.setItem('dev_config', JSON.stringify({apiBaseUrl}))
        applyConfig({apiBaseUrl})
        onRequestClose && onRequestClose()
    }

    const applyConfig = config => {
        if(config.apiBaseUrl){
            axios.defaults.baseURL = `${config.apiBaseUrl}/api/0.1/`
        }
        auth.reset()
    }

    const loadConfig = async () => {
        try {
            const configStr = await AsyncStorage.getItem('dev_config');
            const config = configStr ? JSON.parse(configStr) : undefined;
            console.log('dev config:', config)
            if(config.apiBaseUrl){
                setApiBaseUrl(config.apiBaseUrl)
            }
            applyConfig(config)
        } catch (error) {
        }
    }

    React.useEffect(() => {
        loadConfig()
    }, [visible])

    return <BaseModal
        visible={visible}
        style={{minWidth: 320}}
        onRequestClose={onRequestClose}
    >
        <KeyboardAvoidingView
            behavior="position"
            enabled
        >
            <Text style={styles.feedbackH1}>Api server (https://api.pikdelivery.com)</Text>
            <View style={globalStyles.inputWrapper}>
                <CustomAnimatedInput
                    placeholder="Api server ..."
                    value={apiBaseUrl}
                    onChangeText={setApiBaseUrl}
                />
            </View>
            <View style={[globalStyles.inputWrapper, {flexDirection: 'row'}]}>
                <Text style={globalStyles.link} onPress={() => setApiBaseUrl('http://192.168.1.101:5566')}>Local</Text>
                <Text style={{flexGrow: 1}} />
                <Text style={globalStyles.link} onPress={() => setApiBaseUrl('https://api.pikdelivery.com')}>Server</Text>
            </View>
            <PrimaryButton
                title="Save"
                onPress={onSave}
            />
        </KeyboardAvoidingView>
    </BaseModal>;
};

const styles = StyleSheet.create({
    feedbackH1: {
        fontWeight: '700',
        fontSize: 14,
        lineHeight: 24,
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

export default DevConfigModal;
