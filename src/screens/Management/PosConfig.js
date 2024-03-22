/* eslint-disable react/prop-types */
/* eslint-disable react-native/no-raw-text */
/* eslint-disable no-warning-comments */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-use-before-define */
import { Spinner } from "@ui-kitten/components";
import React, { useContext, useEffect, useState } from "react";
import {
  BackHandler,
  ScrollView,
  StyleSheet,
} from "react-native";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { SettingsIcon } from "../../components/atoms/Icons/Icons";
import { Heading, Label } from "../../components/atoms/Text";
import { Block, Box, Flex } from "../../components/layouts/Index";
import LocationDropdown from "../../components/organisms/LocationDropdown/LocationDropdown";
import MenuDropdown from "../../components/organisms/MenuDropdown/MenuDropdown";
import { AuthContext } from "../../contexts/AuthContext";
import { NormalisedSizes } from "../../hooks/Normalized";
import RoninChipModule from "../../services/RoninChipService";
import { useCardReaderContext } from "../../contexts/CardReaderContext";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Q } from "@nozbe/watermelondb";
import { WriteLog } from "../../../src/CommonLogFile";
import { ConfirmationModal } from "../../../src/components/organisms/ConfirmationModal";
import { KEY_NAME, SYNC_STATUS_VERIFY } from "../../helpers/constants";
import { deleteCachedItem, getCachedItem, setCachedItem } from "../../helpers/storeData";


function PosConfig(props) {
  // eslint-disable-next-line no-unneeded-ternary
  const {
    syncService,
    syncLocationsMenusMenuItems,
    loadingAuth,
    updateTabletSelections,
    tabletSelections: {
      event: selectedEvent,
      location: selectedLocation,
      menu: selectedMenu,
    },
  } = useContext(AuthContext);

  // console.log({ selectedLocation, selectedEvent });
  WriteLog("Select location and menu screen");

  const [loadingValue, setLoadingValue] = useState(false);
  const cardReaderContext = useCardReaderContext();
  const [menu, setMenu] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [selectedLocationValue, setSelectedLocationValue] = useState(null);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(null);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(null);
  const [selectedMenuValue, setSelectedMenuValue] = useState(null);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const database = useDatabase();
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setOpenConfirmationModal(true);
        return true;
      }
    );
  }, []);

  useEffect(() => {
    RoninChipModule.wakeUpCardReader();
  }, []);
  const isFocuse = useIsFocused();

  useEffect(() => {
    // if (!loadingAuth) {
    //   setTimeout(() => {
    //     setLoadingValue(loadingAuth);
    getLocation();
    //   }, 5000);
    // } else {
    //   setLoadingValue(loadingAuth);
    // }
  }, [isFocuse, selectedLocation, loadingAuth]);

  const getLocation = async () => {
    const locationResponse = await database.collections
      .get("locations")
      .query(
        Q.where("event_id", Q.eq(selectedEvent.eventId)),
        Q.sortBy("name", Q.asc)
      )
      .fetch();

    setLocationData([...locationResponse]);
  };
  const getMenuData = async (selectLocationId) => {
    let response = await database.collections.get("menus").query(Q.sortBy("name", Q.asc)).fetch();

    const locationId =
      locationData[selectedLocationIndex?.row]?._raw.location_id;
    let menuDataFilter = (response || []).filter((item) => {
      return item.locationMenus.find((location) => {
        return location.location_id === selectLocationId;
      })?.location_id;
    });

    setMenu([...menuDataFilter]);
  };

  const refreshLocationMenu = async () => {

    setLoading(true)
    await deleteCachedItem(KEY_NAME.LOCATIONS_SYNC);
    await deleteCachedItem(KEY_NAME.MENUS_SYNC);
    await deleteCachedItem(KEY_NAME.MENU_ITEMS_SYNC);
    await deleteCachedItem(KEY_NAME.DISCOUNTS_SYNC);

    await syncLocationsMenusMenuItems(selectedEvent?.eventId, false, true); //2nd boolean argument for Attendees and RFID Sync, 3rd boolean argument for Discount Sync

    let syncStatus = false;

    const fetchData = async () => {
      const locations = await getCachedItem(KEY_NAME.LOCATIONS_SYNC);
      const menus = await getCachedItem(KEY_NAME.MENUS_SYNC);
      const menuItems = await getCachedItem(KEY_NAME.MENU_ITEMS_SYNC);
      const discounts = await getCachedItem(KEY_NAME.DISCOUNTS_SYNC);
      if (locations?.item !== null && menus?.item !== null && menuItems?.item !== null && discounts?.item !== null) {
        syncStatus = false;
      } else {
        syncStatus = true;
      }
    };

    const intervalId = setInterval(() => {
      if (syncStatus) {
        fetchData();
      } else {
        setLoading(false)
        clearInterval(intervalId);
      }
    }, SYNC_STATUS_VERIFY);

  };

  const onSelect = async (index) => {
    setSelectedMenuIndex(index);
    updateTabletSelections({ menu: menu[index.row] });
    // console.log("@@====POS==menu=====",menu[index.row])
    setSelectedMenuValue(menu[index?.row].name);
  };
  const onSelectLocation = async (index) => {
    updateTabletSelections({
      location: locationData[index?.row]._raw,
      menu: null,
    });
    // console.log("@@===POS===location=====",locationData[index?.row]._raw)
   
    setSelectedMenuValue(null);
    setSelectedMenuIndex(null);
    setSelectedLocationIndex(index);
    getMenuData(locationData[index?.row]._raw.location_id);
    setSelectedLocationValue(locationData[index?.row].name);
  };

  const gotoMenuNavigate = async () => {
    await setCachedItem(KEY_NAME.SELECTED_MENU, selectedMenu?.id);
    await setCachedItem(KEY_NAME.SELECTED_LOCATION, selectedLocation?.id);
    props.navigation.navigate("Menu");
  };
  return (
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
                  Location/Menu Selection
                </Heading>
              </Block>

              <Box
                style={{
                  marginTop: NormalisedSizes(16),
                  marginBottom: NormalisedSizes(16),
                }}
              >
                <Block style={styles.containerGap}>
                  <LocationDropdown
                    // selectedEventId={selectedEvent?.eventId}
                    locationData={locationData}
                    selectedValue={selectedLocationValue}
                    onSelectIndex={(index) => onSelectLocation(index)}
                    selectedIndex={selectedLocationIndex}
                  />
                  {/* /> */}
                </Block>

                <Block style={styles.containerGap}>
                  <MenuDropdown
                    menuData={menu}
                    onSelect={(index) => onSelect(index)}
                    selectedIndex={selectedMenuIndex}
                    selectedValue={selectedMenuValue}
                  />
                </Block>
              </Box>

              <Block
                style={{
                  marginTop: NormalisedSizes(16),
                  marginBottom: NormalisedSizes(32),
                }}
              >
                <ButtonExtended
                  onPress={() => gotoMenuNavigate()}
                  size="giant"
                  disabled={!selectedLocationValue || !selectedMenuValue}
                >
                  <Label buttonLabel="LabelGiantBtn">Go To Menu</Label>
                </ButtonExtended>
              </Block>
              <Block
                style={{
                  marginTop: NormalisedSizes(16),
                  marginBottom: NormalisedSizes(32),
                }}
              >
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
                      refreshLocationMenu();
                    }}
                    size="giant"
                  >
                    <Label buttonLabel="LabelGiantBtn">
                      Refresh Locations / Menus
                    </Label>
                  </ButtonExtended>
                )}
              </Block>
            </Flex>
          </Block>
          {selectedLocationValue && (
            <Block style={styles.adminPanelButton}>
              <ButtonExtended
                appearance="ghost"
                status="basic"
                accessoryLeft={SettingsIcon}
                disabled={!selectedEvent.eventId}
                onPress={() =>
                  navigation.navigate("AdminPanel", {
                    screen: "UserPasscode",
                  })
                }
              >
                <Label buttonLabel="LabelGiantBtn" variantStyle="regular">
                  Admin Panel
                </Label>
              </ButtonExtended>
            </Block>
          )}
        </Box>
      </Box>

    </ScrollView>
  );
}

PosConfig.displayName = "Pos Config";

export default PosConfig;

const styles = StyleSheet.create({
  adminPanelButton: {
    alignSelf: "flex-end",
    marginTop: NormalisedSizes(-42),
  },

  containerGap: {
    marginBottom: NormalisedSizes(16),
    marginTop: NormalisedSizes(16),
  },
  refreshEcentBlock: {
    alignSelf: "flex-start",
  },

});
