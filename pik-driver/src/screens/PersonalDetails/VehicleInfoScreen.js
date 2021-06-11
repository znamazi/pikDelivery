import React, {useState, useEffect} from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import KeyboardAvoidingScreen from '../../components/KeyboardAvoidingScreen';
import PageContainerDark from '../../components/PageContainerDark';
import HeaderPage from '../../components/HeaderPage';
import CustomAnimatedInput from '../../components/CustomAnimatedInput';
import {setDocumentsVehicle} from '../../redux/actions';
import {connect} from 'react-redux';
import ButtonPrimary from '../../components/ButtonPrimary';
import CustomPicker from '../../components/CustomPicker';
import VehicleTypes from '../../../../node-back/src/constants/VehicleTypes'
import {useAuth} from '../../utils/auth';

const VehicleInfoScreen = ({navigation, vehicle, updateVehicle}) => {
    let auth = useAuth();

    const [type, setType] = useState('');
    const [makeModel, setMakeModel] = useState('');
    const [color, setColor] = useState('');
    const [plate, setPlate] = useState('');
    const [year, setYear] = useState('');

    const update = () => {
        updateVehicle({type, makeModel, color,plate, year})
        navigation.goBack();
    }

    useEffect(() => {
        let {type,makeModel,plate,year,color} = vehicle;
        setType(type);
        setMakeModel(makeModel)
        setPlate(plate)
        setYear(year)
        setColor(color)
    }, [])

    return (
        <KeyboardAvoidingScreen>
            <PageContainerDark
                Header={<HeaderPage
                    navigation={navigation}
                    title={'Vehicle Info'}
                    color={HeaderPage.Colors.BLACK}
                />}
            >
                <View style={{flexGrow: 1}}>
                    <View style={styles.inputWrapper}>
                        {/*<CustomAnimatedInput value={type} onChangeText={setType} placeholder="Vehicle Type"/>*/}
                        <CustomPicker
                            selectedValue={type || auth?.user?.vehicle?.type}
                            onValueChange={(itemValue, itemIndex) => setType(itemValue)}
                            items={Object.values(VehicleTypes)}
                            placeholder={'Vehicle Type'}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <CustomAnimatedInput
                            value={plate || auth?.user.vehicle?.plate}
                            onChangeText={setPlate}
                            placeholder="Plate ID"
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <CustomAnimatedInput
                            value={color || auth?.user.vehicle?.color}
                            onChangeText={setColor}
                            placeholder="Color"
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <CustomAnimatedInput
                            value={makeModel || auth.user.vehicle?.makeModel}
                            onChangeText={setMakeModel}
                            placeholder="make / model"
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <CustomAnimatedInput
                            value={year || (auth.user.vehicle?.year || '').toString()}
                            onChangeText={setYear}
                            placeholder="Year"
                            type="number"
                        />
                    </View>
                </View>
                <View style={{flexGrow: 0}}>
                    <ButtonPrimary onPress={update} title="Update"/>
                </View>
            </PageContainerDark>
        </KeyboardAvoidingScreen>
    );
};

const styles = StyleSheet.create({
    container: {},
    headline: {
        fontWeight: 'bold',
        fontSize: 40,
    },
    inputWrapper: {
        marginBottom: 15,
    },
    uploadBtn: {
        marginVertical: 20,
    },
});

const mapStateToProps = state => {
    const {documents: {vehicle}} = state;
    return {vehicle};
};

const mapDispatchToProps = dispatch => ({
    updateVehicle: vehicleInfo => dispatch(setDocumentsVehicle(vehicleInfo)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VehicleInfoScreen);
