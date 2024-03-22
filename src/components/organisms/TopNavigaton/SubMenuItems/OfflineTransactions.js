import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import { ButtonExtended } from "../../../atoms/Button/Button";
import { Label, Heading } from "../../../atoms/Text/index";
import ACService from "../../../../services/ACService";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("screen");

export const OfflineTransactions = ({ onComplete }) => {
  const [offlineTxs, setOfflineTxs] = useState({});

  const fetchOfflineTxs = async () => {
    const txs = await ACService.showPendingOfflineTransactions();
    setOfflineTxs(txs);
  };

  const processOfflineTxs = () => {
    ACService.processOfflineTransactions();
  };

  useEffect(() => {
    fetchOfflineTxs();
  }, []);

  return (
    <View
      style={{
        height: SCREEN_HEIGHT - SCREEN_HEIGHT * 0.1,
        width: SCREEN_WIDTH * 0.7,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "black",
        borderWidth: 1,
        flexDirection: "column",
      }}
    >
      <View
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Heading variants="h4">
          {`Total Offline Txs: ${offlineTxs?.size || 0}`}
        </Heading>
        <Text>Deferred Offline Transaction Ids:</Text>
        <ScrollView>
          {Object.keys(offlineTxs).map((refId) => {
            const offlineTx = offlineTxs[refId];
            if (refId !== "size") {
              return (
              <>
                <Text>{refId}</Text>
                {Object.keys(offlineTx).map((txDetail) => (
                  <Text>{`${txDetail}: ${offlineTx[txDetail]}`}</Text>
                ))}
              </>
              );
              
            }
            return null;
          })}
        </ScrollView>
        <ButtonExtended
          style={{
            marginTop: 20,
          }}
          title="Try Again"
          onPress={onComplete}
          status="primary"
          size="small"
        >
          <Label
            buttonLabel="none"
            variants="label"
            variantStyle="uppercaseBold"
          >
            Close
          </Label>
        </ButtonExtended>
        <ButtonExtended
          style={{
            marginTop: 20,
          }}
          title="Try Again"
          onPress={fetchOfflineTxs}
          status="primary"
          size="small"
        >
          <Label
            buttonLabel="none"
            variants="label"
            variantStyle="uppercaseBold"
          >
            Fetch Offline Txs
          </Label>
        </ButtonExtended>
      </View>
    </View>
  );
};
