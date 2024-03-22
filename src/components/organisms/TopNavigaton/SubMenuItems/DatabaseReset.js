import React, {useContext, useEffect, useState} from "react";
import {Q} from "@nozbe/watermelondb";
import {useTheme, Input, Spinner} from "@ui-kitten/components";
import {
    Alert,
    View,
    Text,
    ScrollView,
    StyleSheet,
    Dimensions,
    Modal,
} from "react-native";
import {ButtonExtended} from "../../../atoms/Button/Button";
import {Label, Heading} from "../../../atoms/Text/index";
import {NormalisedSizes, NormalisedFonts} from "../../../../hooks/Normalized";
import {Block, Box, Flex} from "../../../layouts/Index";
import customLogging from "../../../../customLogging";
import {useAuth} from "../../../../contexts/AuthContext";
import {WriteLog} from "../../../../../src/CommonLogFile";
import {useDatabase} from "@nozbe/watermelondb/hooks";

export const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} =
    Dimensions.get("screen");

const DatabaseReset = (props) => {
    const database = useDatabase();
    const {organizerUser, employeeUser, syncService} = useAuth();
    const [password, setPassword] = React.useState("");
    const [showOrderHistory, setshowOrderHistory] = React.useState("");
    const [clearingSyncedOrders, setClearingSyncedOrders] = useState(false);
    const [clearingAllOrders, setClearingAllOrders] = useState(false);
    const [numberOfLocalOrders, setNumberOfLocalOrders] = useState(0);
    const [numberOfPushedOrders, setNumberOfPushedOrders] = useState(0);
    const {orgConfig} = useAuth();
    const [orderState, setOrderState] = React.useState({
        numberOfLocalOrders: 0,
        numberOfpushedOrders: 0,
        loading: true,
        loggedOrders: 0,
        error: "",
        responseData: "",
        batchActions: [],
        successMessage: "",
        te: "init",
    });

    const theme = useTheme();
    const styles = StyleSheet.create({
        heading: {
            marginVertical: 40,
        },
        prompt: {
            alignItems: "center",
            flex: 1,
            paddingHorizontal: 30,
            borderWidth: 1,
            marginTop: 60,
        },
        validateFlex: {
            alignItems: "center",
            padding: 10,
            flexDirection: "column",
            marginVertical: 30,
            width: "100%",
            alignSelf: "center",
        },
    });
    useEffect(() => {
        getOrderDetails();
        const intervalId = setInterval(() => {
            getOrderDetails();
        }, 10000);
        return () => clearInterval(intervalId);
    }, []);

    const getOrderDetails = async () => {
        try {
            const localOrdersCount = await database
                .get("orders")
                .query()
                .fetchCount();
            setNumberOfLocalOrders(localOrdersCount);

            const pushedOrdersCount = await database
                .get("orders")
                .query(Q.where("is_pushed", true))
                .fetchCount();
            setNumberOfPushedOrders(pushedOrdersCount);
        } catch (err) {
            WriteLog("PendingSync err  " + err);
            console.log(err);
        }
    };

    const handlePasswordSubmit = () => {
        if (password.length === 5) {
            if (
                password == employeeUser.tablet_access_code ||
                password == organizerUser.tablet_access_code
            ) {
                setshowOrderHistory(true);
                props.onComplete();
            } else {
                Alert.alert("", `Invalid Pin, Please try again.`, [
                    {
                        text: "Close",
                        onPress: () => {
                            WriteLog("DatabaseReset Invalid Pin, Please try again.");
                            console.log("Invalid Pin, Please try again.");
                        },
                    },
                ]);
            }
        } else {
            Alert.alert("", `Please enter 5 digit pin.`, [
                {
                    text: "Close",
                    onPress: () => {
                        console.log("Please enter 5 digit pin."),
                            WriteLog("DatabaseReset Please enter 5 digit pin.");
                    },
                },
            ]);
        }
    };

    const handleClearPushedOrders = async () => {
        setClearingSyncedOrders(true);
        await props.database.write(async () => {
            const pushedOrders = await props.database
                .get("orders")
                .query(Q.where("is_pushed", true))
                .fetch();
            await Promise.all(pushedOrders.map((order) => order.destroyPermanently()));
        });
        await getOrderDetails();
        setClearingSyncedOrders(false);
    };

    const handleClearAllOrders = async () => {
        setClearingAllOrders(true);
        await props.database.write(async () => {
            const orders = await props.database.get("orders").query().fetch();
            await Promise.all(orders.map((order) => order.destroyPermanently()));
        });
        await getOrderDetails();
        setClearingAllOrders(false);
    };


    const screenState = () => {
            return (
                <View
                    style={{alignItems: "center", justifyContent: "center", flex: 1}}
                >
                    <View style={{marginBottom: 15}}>
                        <Heading variants="h2">
                            {`Orders synced: ${numberOfPushedOrders} / ${numberOfLocalOrders}`}
                        </Heading>
                    </View>
                    <Flex flexDirection="column" alignItems="stretch">
                        <Block
                            style={{
                                marginTop: NormalisedSizes(16),
                                marginBottom: NormalisedSizes(16),
                            }}
                        >
                            {clearingSyncedOrders ? (
                                <ButtonExtended status="basic" size="giant">
                                    <Label
                                        buttonLabel="LabelGiantBtn"
                                        variants="label"
                                        variantStyle="uppercaseBold"
                                    >
                                        <Spinner />
                                    </Label>
                                </ButtonExtended>
                            ) : (
                                <ButtonExtended
                                    onPress={() => {
                                        handleClearPushedOrders();
                                    }}
                                    size="giant"
                                    disabled={false}
                                >
                                    <Label buttonLabel="LabelGiantBtn">Clear Synced Orders</Label>
                                </ButtonExtended>
                            )}
                        </Block>
                        <Block
                            style={{
                                marginTop: NormalisedSizes(16),
                                marginBottom: NormalisedSizes(16),
                            }}
                        >
                            {clearingAllOrders ? (
                                <ButtonExtended status="basic" size="giant">
                                    <Label
                                        buttonLabel="LabelGiantBtn"
                                        variants="label"
                                        variantStyle="uppercaseBold"
                                    >
                                        <Spinner />
                                    </Label>
                                </ButtonExtended>
                            ) : (
                                <ButtonExtended
                                    onPress={() => {
                                        handleClearAllOrders();
                                    }}
                                    size="giant"
                                    disabled={false}
                                >
                                    <Label buttonLabel="LabelGiantBtn">Clear All Orders</Label>
                                </ButtonExtended>
                            )}
                        </Block>
                        <Block
                            style={{
                                marginTop: NormalisedSizes(16),
                                marginBottom: NormalisedSizes(16),
                            }}
                        >
                            <ButtonExtended
                                status="tertiary"
                                onPress={() => setshowOrderHistory(false)}
                                size="giant"
                            >
                                <Label buttonLabel="LabelGiantBtn">Cancel</Label>
                            </ButtonExtended>
                        </Block>
                    </Flex>
                    <View style={{marginTop: 30}}/>

                    {orderState?.loggedOrders > 0 && (
                        <>
                            <Text>Logging Orders</Text>
                            <Text>
                                {`LoggedOrders: ${orderState.loggedOrders} / ${
                                    orderState.numberOfLocalOrders -
                                    orderState.numberOfpushedOrders
                                }`}
                            </Text>
                        </>
                    )}
                    <Text>{orderState.error}</Text>
                </View>
            );
    };

    if (showOrderHistory) {
        return (
            <Modal
                visible={showOrderHistory}
                transparent={true}
            >
                <Box
                    level="1"
                    style={{
                        alignItems: "center",
                        flex: 1,
                        paddingHorizontal: 30,
                        borderWidth: 1,
                        marginTop: 60,
                    }}
                >
                    {screenState()}
                </Box>
            </Modal>
        );
    }
    return (
        <Modal
            visible={props.databaseReset}
            // backdropStyle={styles.backdrop}
            onBackdropPress={props.onComplete}
            transparent={true}
        >
            <Box level="1" style={styles.prompt}>
                <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
                    <Flex style={styles.validateFlex}>
                        <Block style={styles.heading}>
                            <Heading variants="h2">Please enter Organizer or Clerk Access Code.</Heading>
                        </Block>
                        <Input
                            keyboardType="number-pad"
                            disableFullscreenUI
                            autoFocus
                            secureTextEntry
                            onChangeText={(text) => {
                                setPassword(text);
                            }}
                            onSubmitEditing={() => handlePasswordSubmit()}
                            placeholder="PIN"
                            maxLength={5}
                            size="large"
                            style={{width: "100%"}}
                            textStyle={{
                                fontSize: NormalisedFonts(21),
                                lineHeight: NormalisedFonts(30),
                                fontWeight: "400",
                                width: "30%",
                                fontFamily: "OpenSans-Regular",
                            }}
                        />
                    </Flex>
                    <Flex flexDirection="column" alignItems="stretch">
                        <Block
                            style={{
                                marginTop: NormalisedSizes(16),
                                marginBottom: NormalisedSizes(32),
                            }}
                        >
                            <ButtonExtended
                                onPress={() => {
                                    handlePasswordSubmit();
                                }}
                                size="giant"
                                disabled={false}
                            >
                                <Label buttonLabel="LabelGiantBtn">Confirm</Label>
                            </ButtonExtended>
                        </Block>
                        <Block
                            style={{
                                marginTop: NormalisedSizes(16),
                                marginBottom: NormalisedSizes(32),
                            }}
                        >
                            <ButtonExtended
                                status="tertiary"
                                onPress={() => props.onComplete()}
                                size="giant"
                            >
                                <Label buttonLabel="LabelGiantBtn">Cancel</Label>
                            </ButtonExtended>
                        </Block>
                    </Flex>
                </ScrollView>
            </Box>
        </Modal>
    );
};

export default DatabaseReset;
