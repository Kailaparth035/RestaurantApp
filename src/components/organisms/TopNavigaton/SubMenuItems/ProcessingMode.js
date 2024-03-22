import React, {useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {AuthContext, useAuth} from "../../../../contexts/AuthContext";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./DatabaseReset";
import ModalHeaderTitle from "./ModalHeaderTitle";
import ACService from "../../../../services/ACService";

const ProcessingMode = ({ setOnlineModeModal }) => {
    const { setOfflineMode } = useContext(AuthContext);
    const { setAllowBatchMode } = useContext(AuthContext);
    const { setProcessingMode } = useContext(AuthContext);
    const { processingMode } = useAuth();
    const [selectedMode, setSelectedMode] = useState(processingMode);
    const {
        tabletSelections: {
            event: selectedEvent,
            location: selectedLocation,
            menu: selectedMenu,
        },
    } = useAuth();
    const handleModeChange = mode => {
        setSelectedMode(mode);

        if (mode === 'Online Only (No Batches)') {
            setAllowBatchMode(false);
            setOfflineMode(false);
            setProcessingMode(mode);
            ACService.getOfflineMode(false);
        } if (mode === 'Dynamic Processing') {
            setAllowBatchMode(true);
            setOfflineMode(false);
            setProcessingMode(mode);
            ACService.getOfflineMode(false);
        } if (mode === 'Offline Mode (No Real-Time Auth)') {
            setAllowBatchMode(true);
            setOfflineMode(true);
            setProcessingMode(mode);
            ACService.getOfflineMode(true);
        }
    };

    const renderOption = (option) => {
        return (
            <View style={styles.optionContainer}>
                <Text style={styles.optionText}>{option}</Text>
                <TouchableOpacity
                    onPress={() => handleModeChange(option)}
                    style={[
                        styles.toggle,
                        selectedMode === option && styles.toggleSelected,
                    ]}
                />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.modalMainView}>
                <ModalHeaderTitle
                    onclose={() => setOnlineModeModal()}
                    title="Processing Mode"
                />
                <View style={styles.options}>
                    {renderOption('Dynamic Processing')}
                    {renderOption('Online Only (No Batches)')}
                    {renderOption('Offline Mode (No Real-Time Auth)')}
                </View>
            </View>
        </View>
    );
};

export default ProcessingMode;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalMainView: {
        height: SCREEN_HEIGHT - SCREEN_HEIGHT * 0.6,
        width: SCREEN_WIDTH * 0.5,
        display: 'flex',
        borderColor: 'black',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 20,
    },
    options: {
        marginTop: 20,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    optionText: {
        flex: 1,
        fontSize: 18,
    },
    toggle: {
        height: 30,
        width: 60,
        borderRadius: 30,
        backgroundColor: '#353b48',
        justifyContent: 'center',
    },
    toggleSelected: {
        backgroundColor: '#EE2E30',
    },
});