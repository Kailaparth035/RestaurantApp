/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-raw-text */
/* eslint-disable no-warning-comments */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-use-before-define */
import { Q } from "@nozbe/watermelondb";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { Spinner } from "@ui-kitten/components";
import React, { useContext, useEffect, useState } from "react";
import { BackHandler, ScrollView, StyleSheet, View } from "react-native";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { Heading, Label } from "../../components/atoms/Text";
import { Block, Box, Flex } from "../../components/layouts/Index";
import EventDropdown from "../../components/organisms/EventDropdown/EventDropdown";
import { AuthContext } from "../../contexts/AuthContext";
import { NormalisedSizes } from "../../hooks/Normalized";
import RoninChipModule from "../../services/RoninChipService";
import ACModule from "../../services/ACService";
import { WriteLog } from "../../../src/CommonLogFile";
import {
  KEY_NAME,
  SCREEN_NAME,
  SYNC_STATUS_VERIFY
} from "../../helpers/constants";
import { ConfirmationModal } from "../../components/organisms/ConfirmationModal";
import { deleteCachedItem, getCachedItem, setCachedItem } from "../../helpers/storeData";
import { useIsFocused } from "@react-navigation/native";

function OrganizerConfig({
  navigation,
  locations,
  events,
  locationCount,
  eventCount,
  organizationId,
}) {
  WriteLog("Event selection Screen");

  const database = useDatabase();
  const isFocuse = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState([]);
  const [selectedEventValue, setSelectedEventValue] = useState(null);
  const [selectedEventIndex, setSelectedEventIndex] = useState(null);
  const [navigationState, setNavigationState] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);


  const {
    refreshMenu,
    syncLocationsMenusMenuItems,
    syncService,
    organizerUser,
    employeeUser,
    syncUsersEventsAndDiscount,
    loadingAuth,
      setEventIdState,
      eventIdState,
      setAllowRecursive,
    showLoading,
    refreshLocation,
    updateTabletSelections,
    tabletSelections: { event },
  } = useContext(AuthContext);

  const [loadingValue, setLoadingValue] = useState(false);


  const getOrg = async () => {
    const { item: orgId } = await getCachedItem("organizationId");
    getEventData(orgId);
  };

  useEffect(() => {
    setSelectedEventIndex(null);
    setSelectedEventValue(null);
    getOrg();
    RoninChipModule.wakeUpCardReader();
    ACModule.configureScanner();
  }, [isFocuse]);

  useEffect(() => {
    setLoadingValue(loadingAuth);
  }, [loadingAuth]);

  const getEventData = async (organizationId) => {
    const eventResponse = await database.collections
      .get("events")
      .query(Q.sortBy("name", Q.asc))
      .fetch();
    if (eventResponse.length !== 0 && eventResponse) {
      setEventData([...eventResponse]);
    } else {
      getOrg();
    }
  };

  const selectEvent = (index) => {
    setSelectedEventIndex(index);
    setSelectedEventValue(eventData[index?.row].name);
    // console.log("eventData[index?.row] ::::", eventData[index?.row]._raw);
    updateTabletSelections({ event: eventData[index?.row]._raw });
  };

  const pingSyncServiceLocationsMenusItemsRfidAttendees = async () => {
    if (event?.id) {
      await setCachedItem(KEY_NAME.EVENT_ID, event?.id);
      setEventIdState(event?.id);
      setAllowRecursive(true);
      await syncLocationsMenusMenuItems(event?.id, true, false); //boolean arguments, 1: Location/Menus/Items, 2: Attendees/RFIDs, 3: Discounts
      navigation.navigate(SCREEN_NAME.USER_LOGIN, { isSynchronized: true });
    }
  };

  const onEventSelection = async () => {
    if (selectedEventValue !== null) {
      updateTabletSelections({ event: eventData[selectedEventIndex?.row] });
      pingSyncServiceLocationsMenusItemsRfidAttendees();
    }
  };

  const refreshEvents = async () => {
    setLoading(true)
    setSelectedEventIndex(null);
    setSelectedEventValue(null);
    await deleteCachedItem(KEY_NAME.EVENTS_SYNC);
    await syncUsersEventsAndDiscount(false, true, false); //User, Events, Discounts sync
    let eventSyncStatus = false;
    const fetchData = async () => {
      const events = await getCachedItem(KEY_NAME.EVENTS_SYNC);
      if (events?.item !== null) {
        eventSyncStatus = false;
      } else {
        eventSyncStatus = true;
      }
    };

    const intervalId = setInterval(() => {
      if (eventSyncStatus) {
        fetchData();
      } else {
        setLoading(false)
        clearInterval(intervalId);
      }
    }, SYNC_STATUS_VERIFY);
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setOpenConfirmationModal(true);
        return true;
      }
    );
  }, []);

  return eventData.length > 0 ? (
    <ScrollView>
      <ConfirmationModal
        actionType={""}
        visible={openConfirmationModal}
        setVisible={() => setOpenConfirmationModal(false)}
      />
      <Box>
        <Box
          style={{
            marginRight: NormalisedSizes(32),
            marginLeft: NormalisedSizes(32),
          }}
        >
          <Block
            style={{
              marginRight: "auto",
              marginLeft: "auto",
            }}
            width={NormalisedSizes(496)}
          >
            <Flex flexDirection="column" alignItems="stretch">
              <Block
                style={{
                  marginTop: NormalisedSizes(48),
                  marginBottom: NormalisedSizes(32),
                }}
              >
                <Heading style={{ textAlign: "center" }} variants="h2">
                  Event Selection
                </Heading>
              </Block>

              <Box
                style={{
                  marginTop: NormalisedSizes(16),
                  marginBottom: NormalisedSizes(16),
                }}
              >
                <Block style={styles.containerGap}>
                  <EventDropdown
                    eventData={eventData}
                    selectedValue={selectedEventValue}
                    onSelectEvent={(index) => {
                      setNavigationState(true), selectEvent(index);
                    }}
                    selectedIndex={selectedEventIndex}
                  />
                </Block>
              </Box>

              <Block
                style={{
                  marginTop: NormalisedSizes(16),
                  marginBottom: NormalisedSizes(32),
                }}>
                {loadingValue ? (
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
                    onPress={() => onEventSelection()}
                    size="giant"
                    disabled={!selectedEventValue}
                  >
                    <Label buttonLabel="LabelGiantBtn">Set Event</Label>
                  </ButtonExtended>
                )}
              </Block>
              <Block
                style={{
                  marginTop: NormalisedSizes(16),
                  marginBottom: NormalisedSizes(32),
                }}>
                {loading ? (
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
                    status="tertiary"
                    onPress={() => {
                      refreshEvents();
                    }}
                    size="giant"
                  >
                    <Label buttonLabel="LabelGiantBtn">Refresh Events</Label>
                  </ButtonExtended>
                )}
              </Block>
            </Flex>
          </Block>
        </Box>
      </Box>
    </ScrollView>
  ) : (
    <Box level="2" width="100%" height="100%">
      <Block
        style={{
          position: "absolute",
          top: "40%",
          width: "100%",
        }}
      >
        <Flex flexDirection="column" alignItems="center">
          <Label style={styles.containerGap} variantStyle="regular">
            Please wait...
          </Label>
          <Spinner size="large" />
        </Flex>
      </Block>
    </Box>
  );
}

export default OrganizerConfig;

const styles = StyleSheet.create({
  adminPanelButton: {
    alignSelf: "flex-end",
    marginBottom: NormalisedSizes(42),
    marginTop: NormalisedSizes(42),
  },
  containerGap: {
    marginBottom: NormalisedSizes(16),
    marginTop: NormalisedSizes(16),
  },
  refreshEventBlock: {
    marginBottom: NormalisedSizes(42),
    marginTop: NormalisedSizes(42),
  },
});
