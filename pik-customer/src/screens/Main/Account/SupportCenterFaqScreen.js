import React, {useMemo} from 'react';
import {
    StyleSheet,
    Text,
} from 'react-native';
import WebView from 'react-native-webview'
import HeaderPage from '../../../components/HeaderPage';
import PageContainerDark from '../../../components/PageContainerDark';
import KeyboardAvoidingScreen from '../../../components/KeyboardAvoidingScreen';

const SupportCenterFaqScreen = ({navigation, route}) => {
    let faq = route.params?.faq

    let html = useMemo(() => {
        return `<html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <h3 style="text-align: center">${faq.question}</h3>
        ${faq?.answer}
    </body>
</html>`
    }, [])

    return (
        <KeyboardAvoidingScreen>
            <PageContainerDark
                Header={<HeaderPage
                    title={"FAQ"}
                    color={HeaderPage.Colors.BLACK}
                />}
                noScroll
                contentStyle={{
                    flex: 1,
                }}
            >
                <WebView
                    source={{html}}
                    style={[StyleSheet.absoluteFill]}
                />
            </PageContainerDark>
        </KeyboardAvoidingScreen>
    );
};

export default SupportCenterFaqScreen;
