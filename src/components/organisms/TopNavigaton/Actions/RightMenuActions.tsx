/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
// @ts-ignore
import {useDatabase} from "@nozbe/watermelondb/hooks";
import {useApolloClient} from "@apollo/client";
import {MenuItem, OverflowMenu, Modal} from "@ui-kitten/components";
import React, {useState, useContext, useEffect} from "react";
import {StyleSheet, Image, TouchableOpacity, Text, View} from "react-native";
import {Icon} from "react-native-eva-icons";
import {NormalisedFonts, NormalisedSizes} from "../../../../hooks/Normalized";
import {
    InfoIcon,
    OfflineIcon,
    OrderHistoryIcon,
    ThemeIcon,
    RefreshMenuItem,
    PendingSyncItem,
    CardReaderDetails,
    RFIDDetails, AlertIcon,
} from "../../../atoms/Icons/Icons";
import {Subtitle} from "../../../atoms/Text";
import {Box} from "../../../layouts/Index";
import {ConfirmationModal} from "../../ConfirmationModal";
import {AuthContext} from "../../../../contexts/AuthContext";
import {useCardReaderContext} from "../../../../contexts/CardReaderContext";
import DatabaseReset from "../SubMenuItems/DatabaseReset";
import {OfflineTransactions} from "../SubMenuItems/OfflineTransactions";
import {CardReaderConnectionLogs} from "../SubMenuItems/CardReaderConnections";
import {RfidSync} from "../SubMenuItems/RfidSync";
import Images from "../../../../Images";
import PendingSync from "../SubMenuItems/PendingSync";
import ProcessingMode from "../SubMenuItems/ProcessingMode";
import AboutRoninModal from "../SubMenuItems/AboutRoninModal";
import {Q} from "@nozbe/watermelondb";
import ACService from "../../../../services/ACService";
import RoninChipModule from "../../../../services/RoninChipService";
import RelaunchAppModal from "../SubMenuItems/RelaunchAppModal";

const styles = StyleSheet.create({
    innerBox: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        marginRight: NormalisedSizes(24),
    },
    outerBox: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        marginRight: NormalisedSizes(12),
    },
    backdrop: {
        backgroundColor: "rgba(0,0,0,0.35)",
    },
});

export function RightMenuActions({
                                     navigation,
                                     route,
                                     menuVisible,
                                     toggleMenu,
                                     toggleTheme,
                                 }: any) {
    const [visible, setVisible] = useState(false);
    const {
        syncService,
        offlineMode,
        tabletSelections: {location: selectedLocation, menu: selectedMenu},
    } = useContext(AuthContext);
    const cardReaderContext = useCardReaderContext();
    const client = useApolloClient();
    const renderMenuAction = () => (
        <TouchableOpacity style={{padding: 10}} onPress={toggleMenu}>
            <Image source={Images.setting} style={{height: 35, width: 35}}/>
        </TouchableOpacity>
    );
    const database = useDatabase();
    const [databaseReset, setDatabaseReset] = useState(false);
    const [showOfflineTxs, setShowOfflineTxs] = useState(false);
    const [showCardReaderLogs, setShowCardReaderLogs] = useState(false);
    const [showRfidSync, setShowRfidSync] = useState(false);
    const [processingStatusModal, setProcessingStatusModal] = useState(false);
    const [OnlineModeModal, setOnlineModeModal] = useState(false);
    const [aboutRoninModal, setAboutRoninModal] = useState(false);
    const [offlineTxs, setOfflineTxs] = useState({size: 0});
    const [numberOfPendingOrders, setNumberOfPendingOrders] = useState(0);
    const [actionType, setActionType] = useState("");
    const [openRelaunchModal, setOpenRelaunchModal] = useState(false);

    useEffect(() => {
        getOrderDetails();
        const intervalId = setInterval(() => {
            getOrderDetails();
        }, 15000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        RoninChipModule.wakeUpCardReader();
    }, []);


    useEffect(() => {
        fetchOfflineTxs();
        const intervalId = setInterval(() => {
            fetchOfflineTxs();
        }, 15000);
        return () => clearInterval(intervalId);
    }, []);
    const fetchOfflineTxs = async () => {
        try {
            const txs = await ACService.showPendingOfflineTransactions();
            setOfflineTxs(txs);
        } catch (error) {
            console.error("Error fetching offline transactions:", error);
        }
    };

    const getOrderDetails = async () => {
        try {
            const pendingOrders = await database
                .get("orders")
                .query(Q.where("is_pushed", false))
                .fetchCount();
            setNumberOfPendingOrders(pendingOrders);
        } catch (error) {
            console.error("Error fetching order details:", error);
        }
    };

    return (
        <>
            <Box
                style={styles.outerBox}
                padding={undefined}
                margin={undefined}
                backgroundColor={undefined}
                width={undefined}
                height={undefined}
                flexBasis={undefined}
            >
                <View
                    style={{
                        flexDirection: "column",
                    }}
                >
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Icon
                            name="credit-card"
                            width={37}
                            height={37}
                            fill={
                                cardReaderContext.connected
                                    ? cardReaderContext.bluetoothConnected
                                        ? "blue"
                                        : "black"
                                    : "red"
                            }
                        />
                        <Text style={{fontSize: 30, marginRight: 5, marginLeft: 5}}>
                            :{cardReaderContext.connected}
                        </Text>
                        <Icon
                            style={{marginTop: 2.5}}
                            name="cast"
                            width={32}
                            height={32}
                            fill={cardReaderContext.pcbEnabled ? "green" : "orange"}
                        />
                    </View>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <Text style={{fontSize: 17, fontWeight: "400"}}>P :</Text>
                        <Text style={{fontSize: 18, fontWeight: "700", marginLeft: 5}}>
                            {numberOfPendingOrders}{" "}
                        </Text>
                        <Text style={{fontSize: 17, fontWeight: "400"}}>D :</Text>
                        <Text style={{fontSize: 18, fontWeight: "700", marginLeft: 5}}>
                            {offlineTxs?.size || 0}
                        </Text>
                    </View>
                </View>
                {offlineMode && (
                    <Image
                        source={Images.offlineWifi}
                        style={{height: 30, width: 30, marginLeft: 15, marginBottom: 10}}
                    />
                )}
            </Box>
            <OverflowMenu
                anchor={renderMenuAction}
                visible={menuVisible}
                onBackdropPress={toggleMenu}
                style={{height: "100%"}}
            >
                {route.name === "Menu" && (
                    <MenuItem
                        accessoryLeft={RefreshMenuItem}
                        title={(TextProps) => (
                            <Subtitle
                                style={{
                                    textAlign: "left",
                                    flex: 1,
                                    // @ts-ignore
                                    color: TextProps.style[0].color,
                                }}
                                variants="s2"
                                variantStyle="regular"
                            >
                                Refresh Menu/Items
                            </Subtitle>
                        )}
                        onPress={() => {
                            setVisible(true);
                            setActionType("referesh");
                            toggleMenu();
                        }}
                    />
                )}
                {selectedLocation && selectedMenu && (
                    <MenuItem
                        accessoryLeft={OrderHistoryIcon}
                        title={(TextProps) => (
                            <Subtitle
                                style={{
                                    textAlign: "left",
                                    flex: 1,
                                    // @ts-ignore
                                    color: TextProps.style[0].color,
                                }}
                                variants="s2"
                                variantStyle="regular"
                            >
                                Order History
                            </Subtitle>
                        )}
                        onPress={() => {
                            toggleMenu();
                            navigation.navigate("OrderHistory");
                        }}
                    />
                )}
                <MenuItem
                    accessoryLeft={CardReaderDetails}
                    // @ts-ignore
                    style={{fontSize: NormalisedFonts(20)}}
                    title={(TextProps) => (
                        <Subtitle
                            style={{
                                textAlign: "left",
                                flex: 1,
                                // @ts-ignore
                                color: TextProps.style[0].color,
                            }}
                            variants="s2"
                            variantStyle="regular"
                        >
                            Card Reader Details
                        </Subtitle>
                    )}
                    onPress={() => {
                        setShowCardReaderLogs(true), toggleMenu();
                    }}
                />
                <MenuItem
                    accessoryLeft={RFIDDetails}
                    // @ts-ignore
                    style={{fontSize: NormalisedFonts(20)}}
                    title={(TextProps) => (
                        <Subtitle
                            style={{
                                textAlign: "left",
                                flex: 1,
                                // @ts-ignore
                                color: TextProps.style[0].color,
                            }}
                            variants="s2"
                            variantStyle="regular"
                        >
                            RFID Details
                        </Subtitle>
                    )}
                    onPress={() => {
                        setShowRfidSync(true), toggleMenu();
                    }}
                />
                <MenuItem
                    accessoryLeft={PendingSyncItem}
                    // @ts-ignore
                    style={{fontSize: NormalisedFonts(20)}}
                    title={(TextProps) => (
                        <Subtitle
                            style={{
                                textAlign: "left",
                                flex: 1,
                                // @ts-ignore
                                color: TextProps.style[0].color,
                            }}
                            variants="s2"
                            variantStyle="regular"
                        >
                            Pending Sync
                        </Subtitle>
                    )}
                    onPress={() => {
                        setProcessingStatusModal(true);
                    }}
                />
                <MenuItem
                    accessoryLeft={OrderHistoryIcon}
                    title={(TextProps) => (
                        <Subtitle
                            style={{
                                textAlign: "left",
                                flex: 1,
                                // @ts-ignore
                                color: TextProps.style[0].color,
                            }}
                            variants="s2"
                            variantStyle="regular"
                        >
                            Processing Mode
                        </Subtitle>
                    )}
                    onPress={() => {
                        setOnlineModeModal(true), toggleMenu();
                    }}
                />
                <MenuItem
                    accessoryLeft={ThemeIcon}
                    title={(TextProps) => (
                        <Subtitle
                            style={{
                                textAlign: "left",
                                flex: 1,
                                // @ts-ignore
                                color: TextProps.style[0].color,
                            }}
                            variants="s2"
                            variantStyle="regular"
                        >
                            Switch Color Mode
                        </Subtitle>
                    )}
                    onPress={() => {
                        toggleTheme();
                        toggleMenu();
                    }}
                />
                <MenuItem
                    accessoryLeft={OfflineIcon}
                    // @ts-ignore
                    style={{fontSize: NormalisedFonts(20)}}
                    title={(TextProps) => (
                        <Subtitle
                            style={{
                                textAlign: "left",
                                flex: 1,
                                // @ts-ignore
                                color: TextProps.style[0].color,
                            }}
                            variants="s2"
                            variantStyle="regular"
                        >
                            Relaunch App
                        </Subtitle>
                    )}
                    onPress={() => {
                        setOpenRelaunchModal(true);
                        setActionType("reLaunchApp");
                        toggleMenu();
                    }}
                />
                <MenuItem
                    accessoryLeft={AlertIcon}
                    // @ts-ignore
                    style={{fontSize: NormalisedFonts(20)}}
                    title={(TextProps) => (
                        <Subtitle
                            style={{
                                textAlign: "left",
                                flex: 1,
                                // @ts-ignore
                                color: TextProps.style[0].color,
                            }}
                            variants="s2"
                            variantStyle="regular"
                        >
                            Reset Database
                        </Subtitle>
                    )}
                    onPress={() => {
                        toggleMenu();
                        setTimeout(() => {
                            setDatabaseReset(true);
                        }, 500);
                    }}
                />
                <MenuItem
                    accessoryLeft={InfoIcon}
                    // @ts-ignore
                    style={{fontSize: NormalisedFonts(20)}}
                    title={(TextProps) => (
                        <Subtitle
                            style={{
                                textAlign: "left",
                                flex: 1,
                                // @ts-ignore
                                color: TextProps.style[0].color,
                            }}
                            variants="s2"
                            variantStyle="regular"
                        >
                            About RONIN
                        </Subtitle>
                    )}
                    onPress={() => {
                        setAboutRoninModal(true);
                        toggleMenu();
                    }}
                />
            </OverflowMenu>
            <Modal
                visible={showRfidSync}
                backdropStyle={styles.backdrop}
                onBackdropPress={() => setShowRfidSync(false)}
            >
                <RfidSync
                    {...{
                        onComplete: () => {
                            setShowRfidSync(false);
                        },
                        navigation: {navigation},
                    }}
                />
            </Modal>
            <Modal
                visible={showCardReaderLogs}
                backdropStyle={styles.backdrop}
                onBackdropPress={() => setShowCardReaderLogs(false)}
            >
                <CardReaderConnectionLogs
                    {...{
                        onComplete: () => setShowCardReaderLogs(false),
                        cardReaderContext,
                    }}
                />
            </Modal>
            <Modal
                visible={showOfflineTxs}
                onBackdropPress={() => setShowOfflineTxs(false)}
            >
                <OfflineTransactions
                    {...{
                        onComplete: () => setShowOfflineTxs(false),
                    }}
                />
            </Modal>
            <DatabaseReset
                database={database}
                syncService={syncService}
                client={client}
                databaseReset={databaseReset}
                onComplete={() => setDatabaseReset(false)}
            />
            {/* </Modal> */}
            <ConfirmationModal
                actionType={actionType}
                visible={visible}
                setVisible={setVisible}
                fromOverflow
            />
            {/* processingStatusModal */}
            <Modal visible={processingStatusModal} backdropStyle={styles.backdrop}>
                <PendingSync
                    setProcessingStatusModal={() => setProcessingStatusModal(false)}
                />
            </Modal>
            {/* Switching Color Mode */}
            <Modal visible={OnlineModeModal} backdropStyle={styles.backdrop}>
                <ProcessingMode setOnlineModeModal={() => setOnlineModeModal(false)}/>
            </Modal>

            {/* About Ronin Mode */}
            <Modal visible={aboutRoninModal} backdropStyle={styles.backdrop}>
                <AboutRoninModal setAboutRoninModal={() => setAboutRoninModal(false)}/>
            </Modal>

            <Modal visible={openRelaunchModal} backdropStyle={styles.backdrop}>
                <RelaunchAppModal onCloseModal={() => setOpenRelaunchModal(false)}/>
            </Modal>
        </>
    );
}
