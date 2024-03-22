/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable react/prop-types */
import { Q } from "@nozbe/watermelondb";
import { withDatabase } from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import { useNavigation } from "@react-navigation/native";
import { Button, Tab, TabBar } from "@ui-kitten/components";
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FlatList, ScrollView, View } from "react-native";
import { useTrackedState } from "../contexts/CustomItemsProvider";
import { NormalisedSizes } from "../hooks/Normalized";
import { globalStyles } from "../styles/global";
import { PlusOutlineIcon } from "./atoms/Icons/Icons";
import { Label, Subtitle } from "./atoms/Text/index";
import { Box } from "./layouts/BoxContainer";
import MenuItem from "./molecules/MenuItem/MenuItem";
import { useIsFocused } from "@react-navigation/native";
import { AuthContext, useAuth } from "../contexts/AuthContext";

const MenuItems = memo(({ mSelectedMenu }) => {
  const sectionTab = [
    {
      tab: [
        { name: "all", value: "all" },
        { name: "beer", value: "beer" },
        { name: "liquor", value: "liquor" },
        { name: "wine", value: "wine" },
        { name: "non-alc", value: "nonAl" },
        { name: "merch", value: "merchandise" },
        { name: "food", value: "food" },
      ],
    },
    {
      tab: [
        { name: "favorite", value: "favorites" },
        { name: "all", value: "all" },
        { name: "beer", value: "beer" },
        { name: "liquor", value: "liquor" },
        { name: "wine", value: "wine" },
        { name: "non-alc", value: "nonAl" },
        { name: "merch", value: "merchandise" },
        { name: "food", value: "food" },
      ],
    },
  ];

  // console.log({menus})
  const isFocuse = useIsFocused();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [favSelectedMenu, setFavSelectedMenu] = useState(mSelectedMenu);
  const navigation = useNavigation();
  const [menuData, setMenuData] = useState([]);
  const [isAllRemove, setIsAllRemove] = useState(true);
  const [isCustomeItem, setIsCustomeItem] = useState(
    mSelectedMenu.is_custom_item
  );
  const [tabBar, setTabBar] = useState([]);
  const state = useTrackedState();

  let allItems = [];
  let myFavorites = [];

  const {
    loadingAuth,
    updateTabletSelections,
    tabletSelections: {
      event: selectedEvent,
      location: selectedLocation,
      menu: selectedMenu,
    },
  } = useContext(AuthContext);

  useEffect(() => {
    if (loadingAuth === false) {
      sectionContent(selectedIndex, true);
    }
  }, [favSelectedMenu, updateTabletSelections]);

  const sectionContent = (index, key) => {
    let tab;
    let tab_index = index;
    if (favSelectedMenu.items) {
      favSelectedMenu.items.forEach((x) => {
        if (x.item.isFavorite == undefined) {
          x.item.isFavorite = false;
        }
        allItems.push(x.item);
      });
    }

    myFavorites = allItems
      .sort((a, b) => (a.name < b.name ? -1 : 1))
      .filter((item) => item.isFavorite);
    tab = myFavorites.length > 0 ? sectionTab[1].tab : sectionTab[0].tab;
    setTabBar(tab);

    if (key === true) {
      if (tab.length === 8) {
        if (myFavorites.length === 1) {
          if (isAllRemove) {
            tab_index = index + 1;
            setIsAllRemove(false);
          }
        }
      } else if (tab.length === 7) {
        setIsAllRemove(true);
        if (tab_index > 0) {
          tab_index = tab_index - 1;
        }
      }
    }

    allItems = allItems.sort((a, b) => (a.name < b.name ? -1 : 1));

    const itemsByCategory = {
      all: allItems,
      favorites: [],
      beer: [],
      liquor: [],
      wine: [],
      nonAl: [],
      merchandise: [],
      food: [],
    };

    allItems.forEach((item) => {
      (item.tags || []).forEach((tag) => {
        if (itemsByCategory[tag]) {
          itemsByCategory[tag].push(item);
        }
      });
      if (item.isFavorite === true) {
        itemsByCategory.favorites.push(item);
      }
    });

    if (tab[tab_index].value !== "favorites") {
      if (isCustomeItem) {
        setMenuData([
          ...itemsByCategory[tab[tab_index].value],
          ...state.customItems,
          { addProduct: true },
        ]);
      } else {
        setMenuData([...itemsByCategory[tab[tab_index].value]]);
      }
    } else {
      setMenuData([...itemsByCategory[tab[tab_index].value]]);
    }
    setSelectedIndex(tab_index);
  };

  const handleFavoritePress = (item) => {
    let mFavSelectedMenu = favSelectedMenu.items;

    mFavSelectedMenu.map((mItem, mIndex) => {
      if (item.id === mItem.item.id) {
        if (mItem.item.isFavorite === true) {
          mFavSelectedMenu[mIndex].item.isFavorite = false;
        } else {
          mFavSelectedMenu[mIndex].item.isFavorite = true;
        }
      }
    });

    let newFavObj = {
      _changed: favSelectedMenu._changed,
      _status: favSelectedMenu._status,
      created_at: favSelectedMenu.created_at,
      event_id: favSelectedMenu.event_id,
      id: favSelectedMenu.id,
      is_active: favSelectedMenu.is_active,
      is_cash: favSelectedMenu.is_cash,
      is_credit: favSelectedMenu.is_credit,
      is_custom_item: favSelectedMenu.is_custom_item,
      is_rfid: favSelectedMenu.is_rfid,
      is_qr: favSelectedMenu.is_qr,
      is_tips: favSelectedMenu.is_tips,
      tip_percentage_1: favSelectedMenu.tip_percentage_1,
      tip_percentage_2: favSelectedMenu.tip_percentage_2,
      tip_percentage_3: favSelectedMenu.tip_percentage_3,
      items: mFavSelectedMenu,
      location_id: favSelectedMenu.location_id,
      location_menus: favSelectedMenu.location_menus,
      menu_id: favSelectedMenu.menu_id,
      name: favSelectedMenu.name,
      tax_type: favSelectedMenu.tax_type,
      updated_at: favSelectedMenu.updated_at,
      category: favSelectedMenu.category,
      is_discount: favSelectedMenu.is_discount,
      is_discount_protected: favSelectedMenu.is_discount_protected,
      is_cash_not_taxed: favSelectedMenu.is_cash_not_taxed,
    };
    setFavSelectedMenu(newFavObj);
  };

  const renderMenuItem = ({ item, index, tax_type }) => {
    if (item.addProduct) {
      return (
        <Button
          onPress={addProduct}
          accessoryLeft={PlusOutlineIcon}
          status="tertiary"
          style={{
            marginLeft: index % 3 !== 0 ? NormalisedSizes(20) : 0,
            marginTop: index >= 3 ? NormalisedSizes(20) : 0,
            width: NormalisedSizes(309),
            height: NormalisedSizes(100),
            paddingRight: NormalisedSizes(6.5),
            paddingLeft: NormalisedSizes(6.5),
            paddingTop: NormalisedSizes(12),
            paddingBottom: NormalisedSizes(12),
            borderRadius: 4,
            borderWidth: 2,
          }}
        >
          Create custom item
        </Button>
      );
    }
    return (
      <MenuItem
        style={{
          marginLeft: index % 3 !== 0 ? NormalisedSizes(20) : 0,
          marginTop: index >= 3 ? NormalisedSizes(20) : 0,
        }}
        key={item?.id}
        item={item}
        handleFavoritePress={() => handleFavoritePress(item)}
        tax_type={tax_type}
      />
    );
  };

  const addProduct = () => {
    navigation.navigate("CreateCustomItem");
  };

  return (
    <Box style={globalStyles.menuContainer} level="3">
      <TabBar
        selectedIndex={selectedIndex}
        onSelect={(index) => sectionContent(index, false)}
        appearance="noIndicator"
        style={{ marginBottom: NormalisedSizes(23) }}
      >
        {tabBar.map((item) => (
          <Tab
            key={item.name}
            title={(TextProps) => (
              <Label
                style={{
                  color: TextProps.style.color,
                  marginVertical: NormalisedSizes(
                    TextProps.style.marginVertical
                  ),
                  paddingHorizontal: NormalisedSizes(6),
                  paddingVertical: NormalisedSizes(12),
                }}
                variantStyle="uppercaseBold"
                buttonLabel="LabelLargeBtn"
              >
                {item.name}
              </Label>
            )}
          />
        ))}
      </TabBar>
      <View style={globalStyles.categoryContainer} />
      {favSelectedMenu?.id ? (
        <View style={globalStyles.menuItemsContainer}>
          {selectedIndex !== undefined && (
            <FlatList
              data={menuData}
              renderItem={(item) =>
                renderMenuItem({ ...item, tax_type: favSelectedMenu?.tax_type })
              }
              keyExtractor={(item, index) => index}
              numColumns={3}
              nestedScrollEnabled
            />
          )}
        </View>
      ) : (
        <ScrollView>
          <Subtitle>
            Please Choose A Location And Menu To Display Menu Items
          </Subtitle>
        </ScrollView>
      )}
    </Box>
  );
});

const enhance = withObservables(["mSelectedMenu"], ({ mSelectedMenu }) => {
  const menu = mSelectedMenu.observe();
  return {
    menu,
  };
});

export default withDatabase(enhance(MenuItems));
