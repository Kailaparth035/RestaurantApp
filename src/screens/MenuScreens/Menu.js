/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-raw-text */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-warning-comments */
/* eslint-disable react/prop-types */
/* eslint-disable no-console */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-native/no-inline-styles */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Heading, Label, Subtitle } from "../../components/atoms/Text";
import { Block, Box } from "../../components/layouts/block";
import OrderPanel from "../../components/organisms/OrderPanel";
import { useAuth } from "../../contexts/AuthContext";
import { NormalisedFonts, NormalisedSizes } from "../../hooks/Normalized";
import { globalStyles } from "../../styles/global";
import { Tab, TabBar, Button, Input, useTheme } from "@ui-kitten/components";
import {
  View,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Animated,
  Text,
  Easing,
  Dimensions,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  DeviceEventEmitter,
  BackHandler,
} from "react-native";
import MenuItem from "../../components/molecules/MenuItem/MenuItem";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import {
  MinusOutlineIcon,
  PlusOutlineIcon,
} from "../../components/atoms/Icons/Icons";
import { useTrackedState } from "../../contexts/CustomItemsProvider";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Images from "../../Images";
import {
  DecreasingOrderData,
  getModifierKey,
  getModifierPrice,
  getQuantity,
} from "../../../src/helpers/IsInCart";
import { useTracked } from "../../../src/contexts/CartContext";
import ModalHeaderTitle from "../../components/organisms/TopNavigaton/SubMenuItems/ModalHeaderTitle";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../components/TipInputModal";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { UPDATE_MENUITEM_UPC } from "../../fragments/resolvers";
import { useApolloClient } from "@apollo/client";
import { formatNumber } from "../../helpers/calc";
import { useNetInfo } from "@react-native-community/netinfo";
import { Q } from "@nozbe/watermelondb";
import ACModule from "../../services/ACService";
import { WriteLog } from "../../CommonLogFile";
import { ConfirmationModal } from "../../components/organisms/ConfirmationModal";
import { Flex } from "../../components/layouts/Index";
import { SYNC_STATUS_VERIFY } from "../../helpers/constants";
import { isArray } from "lodash";

const modier_array = [
  {
    sub_type_name: "color",
    selectedIndex: 0,
    sub_type: [
      {
        id: 8,
        name: "Blue",
        sub_type: "color",
        additional_price: 2,
      },
      {
        id: 5,
        name: "Green",
        sub_type: "color",
        additional_price: 2,
      },
      {
        id: 5,
        name: "Pink",
        sub_type: "color",
        additional_price: 2,
      },
      {
        id: 5,
        name: "red",
        sub_type: "color",
        additional_price: 2,
      },
    ],
  },
  {
    sub_type_name: "size",
    selectedIndex: 0,
    sub_type: [
      {
        id: 11,
        name: "Medium",
        sub_type: "size",
        additional_price: 2,
      },
      {
        id: 12,
        name: "Large",
        sub_type: "size",
        additional_price: 2,
      },
      {
        id: 10,
        name: "Small",
        sub_type: "size",
        additional_price: 2,
      },
    ],
  },
];

export const Menu = (props) => {
  WriteLog("Menu Screen");
  const {
    loadingAuth,
    menuDisplayRefresh,
    tabletSelections: { menu: selectedMenu },
  } = useAuth();

  const navigation = useNavigation();

  const isFocuse = useIsFocused();
  const state = useTrackedState();
  const [cartState, dispatch] = useTracked();
  // console.log("cartState :::", JSON.stringify(cartState));
  const netInfo = useNetInfo();
  const theme = useTheme();
  const client = useApolloClient();
  const [animation] = useState(() => new Animated.Value(0));
  const [categoryData, setCategoryData] = useState([]);
  const [selectedCatIndex, setSelectedCatIndex] = useState(0);
  const [menuItem, setMenuItem] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [allCategoryData, setAllCategoryData] = useState([]);
  const [isAllRemove, setIsAllRemove] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [visible, setVisible] = useState(false);
  const [modificationTypeArray, setModificationTypeArray] =
    useState(modier_array);
  const [upcTags, setUpcTags] = useState([]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setVisible(true);
        return true;
      }
    );
  }, []);

  const increase = (payload) => {
    // console.log("increment :::", payload);
    dispatch({ type: "INCREMENT", payload });
  };

  const addItem = (payload) => {
    // console.log("addItem :::", payload);
    dispatch({ type: "ADD_ITEM", payload });
  };

  const decrease = (payload) => {
    dispatch({ type: "DECREMENT", payload });
  };

  const removeItem = (payload) => {
    dispatch({ type: "REMOVE_ITEM", payload });
  };

  const [itemDetails, setItemDetails] = useState("");
  const [longPressModal, setLongPressModal] = useState(false);
  const [upcModalOpen, setUpcModalOpen] = useState(false);
  const [upcValue, setUpcValue] = useState("");
  const [upcloader, setUpcloader] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [itemModificationModal, setItemModificationModal] = useState(false);
  const [modifyTypeIndex, setModifyTypeIndex] = useState(0);
  const [modifierItem, setModifierItem] = useState("");
  const [selectModificationtype, setSelectModificationtype] = useState("");
  const [modifierItemQnt, setModifierItemQnt] = useState(1);
  const [openItemPriceModal, setOpenItemPriceModal] = useState(false);
  const [variableItemPrice, setVariableItemPrice] = useState(0);
  const [variablePriceItem, setVariablePriceItem] = useState("");

  const database = useDatabase();

  useEffect(() => {
    ACModule.configureScanner();
  }, []);

  useEffect(() => {
    //console.log("========@ useEffect @=========");
    getCategoryList();
  }, [isFocuse,menuDisplayRefresh]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "onBarcodeScanResult",
      async (event) => {
        setUpcValue(event);
        getCategoryList(event);
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const capitalizedString = (text) => {
    const data = text;
    return data.toUpperCase();
  };

  const capitalizeFirstLetter = (word) => {
    if (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    } else {
      return "";
    }
  };

  const convertObjToArray = ({ sequance = 0, categoryData = [] }) => {
    const arrayFromValue = Array.from(
      { length: sequance },
      (_, valueIndex) => valueIndex + 1
    );

    const catResponse = arrayFromValue.map((item) => ({
      cat_id: item,
      cat_name: categoryData[`cat_${item}`],
      cat_hide: categoryData[`cat_${item}_hide`],
      cat_itemsId: categoryData[`cat_${item}_itemsIds`]?.map((itemId) =>
        parseInt(itemId)
      ),
    }));
    return catResponse;
  };

  const getCategoryList = async (event) => {
    const reponseCat = convertObjToArray({
      sequance: 6,
      categoryData: selectedMenu?.category,
    });
    let tempCategory = [
      {
        cat_id: 0,
        cat_name: "Favorites",
        cat_hide: true,
        cat_itemsId: [],
      },
    ];
    reponseCat.map((catItem) => {
      tempCategory.push(catItem);
    });
    const menuItemList = await database.collections
      .get("menuItems")
      .query()
      .fetch();

    let temp_menuItem = [];
    menuItemList.map((mapItem) => {
      temp_menuItem.push({
        ...mapItem._raw,
        quantity: 0,
        is_custom_item: false,
      });
      if (mapItem._raw.is_favorite) {
        tempCategory[0].cat_itemsId.push(mapItem._raw.menu_item_id);
        tempCategory[0].cat_hide = false;
      }
    });

    setAllCategoryData([...tempCategory]);
    let response = tempCategory.filter((item) => {
      if (item.cat_hide === false) return item;
    });

    setAllMenuItems([...temp_menuItem]);
    setCategoryData([...response]);
    getMenuItemList(selectedCatIndex, response, temp_menuItem, event);
  };

  const getMenuItemList = (index, categoryList, menuItemList, event) => {
    let arr = [];
    let category = categoryList[index].cat_itemsId;
    if (category.length !== 0) {
      arr = menuItemList
        .sort((a, b) => (a.name < b.name ? -1 : 1))
        .filter((item) => category.includes(item.menu_item_id));
    }
    if (state.customItems.length !== 0) {
      state.customItems.map((custItem) => {
        arr.push({ ...custItem, is_favorite: false });
      });
    }
    if (selectedMenu?.is_custom_item) {
      arr.push({ is_custom_item: true });
    }

    let scanItem;
    if (event) {
      let scanUpCode = event;
      arr.map((arrayItem) => {
        // console.log("arrayItem ===>", arrayItem.upc);
        // console.log("scanData ===>", event);
        if (
          arrayItem.upc != undefined &&
          arrayItem.upc.toLowerCase() == scanUpCode.toString().toLowerCase()
        ) {
          scanItem = arrayItem;
        }
      });
    }

    if (scanItem) {
      const latestQuantity = getQuantity(scanItem, cartState.cartItems);
      if (latestQuantity > 0) {
        increase(scanItem);
      } else {
        addItem(scanItem);
      }
    }
    if (showSearchModal) {
      if (searchText.length !== 0) {
        let data = arr.filter((item) => {
          if (item.name !== undefined) {
            return item.name.toLowerCase().includes(searchText.toLowerCase());
          }
        });
        setMenuItem([...data]);
      } else {
        setMenuItem([...arr]);
      }
    } else {
      setMenuItem([...arr]);
    }

    setSelectedCatIndex(index);
  };

  const handleFavoritePress = async (item, index) => {
    let mCategory = allCategoryData;
    let allItem = allMenuItems;
    let allItemIndex = allMenuItems.indexOf(item);
    let tab_index = selectedCatIndex;

    // console.log("allItemIndex ::::", allItemIndex);
    let favValue = false;
    if (allItem[allItemIndex].is_favorite === false) {
      mCategory[0].cat_itemsId.push(item.menu_item_id);
      allItem[allItemIndex].is_favorite = true;
      favValue = true;
    } else {
      const index = mCategory[0].cat_itemsId.indexOf(item.menu_item_id);
      if (index > -1) {
        // only splice array when item is found
        mCategory[0].cat_itemsId.splice(index, 1); // 2nd parameter means remove one item only
      }
      // mCategory[0].cat_itemsId.pop(item.menu_item_id);
      allItem[allItemIndex].is_favorite = false;
      favValue = false;
    }

    const menuItems = await database.collections
      .get("menuItems")
      .query(Q.where("id", allItem[allItemIndex].id))
      .fetch();

    await database.write(async () => {
      await menuItems[0].update((item) => {
        item.is_favorite = favValue;
        return item;
      });
    });

    if (mCategory[0].cat_itemsId.length !== 0) {
      mCategory[0].cat_hide = false;
    } else {
      mCategory[0].cat_hide = true;
    }

    let response = mCategory.filter((item) => {
      if (item.cat_hide === false) return item;
    });

    setCategoryData([...response]);
    setAllMenuItems([...allItem]);

    let myFavorites = allItem
      .sort((a, b) => (a.name < b.name ? -1 : 1))
      .filter((item) => item.is_favorite);

    if (myFavorites.length === 1) {
      if (isAllRemove) {
        tab_index = tab_index + 1;
        setIsAllRemove(false);
      }
    } else if (myFavorites.length === 0) {
      setIsAllRemove(true);
      if (tab_index > 0) {
        tab_index = tab_index - 1;
      }
    }
    getMenuItemList(tab_index, response, allItem);
  };

  const addProduct = () => {
    navigation.navigate("CreateCustomItem", {
      categoryId: categoryData[selectedCatIndex].cat_id,
      categoryData: selectedMenu.category,
      menu_id: selectedMenu.id,
    });
  };

  const searchMenuItem = () => {
    let arr = [];
    let category = categoryData[selectedCatIndex].cat_itemsId;
    arr = allMenuItems
      .sort((a, b) => (a.name < b.name ? -1 : 1))
      .filter((item) => category.includes(item.menu_item_id));

    if (searchText !== "") {
      let data = arr.filter((item) => {
        if (item.name !== undefined) {
          return item.name.toLowerCase().includes(searchText.toLowerCase());
        }
      });
      setMenuItem([...data]);
    } else {
      getCategoryList();
    }
  };

  const animationButton = () => {
    if (showSearchModal) {
      setShowSearchModal(false);
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
      setSearchText(" ");
    } else {
      Animated.timing(animation, {
        toValue: 300,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
      setShowSearchModal(true);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (categoryData.length !== 0) {
        if (categoryData[0].cat_name === "Favorites") {
          getMenuItemList(selectedCatIndex, categoryData, allMenuItems);
        } else {
          if (searchText.length < 2) {
            getCategoryList();
          } else {
            searchMenuItem();
          }
        }
      }
      // Send Axios request here
    }, SYNC_STATUS_VERIFY);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const updateUpc = async () => {
    if (netInfo?.isConnected) {
      setUpcloader(true);
      try {
        await client
          .mutate({
            mutation: UPDATE_MENUITEM_UPC,
            variables: {
              id: itemDetails.id,
              input: { upc: JSON.stringify(upcTags) },
            },
          })
          .then(async (updateItemresponse) => {
            if (updateItemresponse.data.update_items_by_pk !== null) {
              const menuItems = await database.collections
                .get("menuItems")
                .query(Q.where("id", itemDetails.id))
                .fetch();
              await database.write(async () => {
                await menuItems[0].update((item) => {
                  item.upc = JSON.stringify(upcTags);
                  return item;
                });
              });
              setUpcloader(false);
              setUpcModalOpen(false);
              setLongPressModal(false);
              setUpcValue("");
              Alert.alert(
                "",
                "UPC updated successfully for " +
                  itemDetails.name +
                  ".\nWhen Finished Associating All UPCs Refresh All Menus.",
                [
                  {
                    text: "Ok",
                    onPress: () => { },
                  },
                ]
              );
            } else {
              alert("UPC not updated.");
            }
          })
          .catch((error) => {
            alert("Something went wrong.");
            WriteLog(error);
            WriteLog("menu error ::" + error);
            // console.log("error :::", error);
            setUpcloader(false);
          });

        getCategoryList();
      } catch (error) {
        setUpcloader(false);
        WriteLog(error);
        WriteLog("menu error ::" + error);
        // console.log("error ::", error);
      }
    } else {
      alert("Please check internet connnection.");
    }
  };

  const selectedModifiactionType = (item) => {
    // console.log("index :::", item.id);
    setSelectModificationtype(item.id);
    const temp = modificationTypeArray;
    temp[modifyTypeIndex].sub_type.map((mapItem, mapIndex) => {
      if (mapItem.id === item.id) {
        if (temp[modifyTypeIndex].selectedIndex !== undefined) {
          temp[modifyTypeIndex].selectedIndex = item.id;
        } else {
          temp[modifyTypeIndex] = {
            ...temp[modifyTypeIndex],
            selectedIndex: item.id,
          };
        }
      }
    });
    // console.log("temp ====>", JSON.stringify(temp));
    setModificationTypeArray([...temp]);

    // **  If any modifier select then navigate to next modifier. ** //
    if (modifyTypeIndex < modificationTypeArray.length - 1) {
      next("next");
    } else {
      next("placeOrder");
    }
  };

  const getSelectedModifier = useCallback(() => {
    let temp = "";
    modificationTypeArray.map((mapItem) => {
      if (mapItem.selectedIndex) {
        temp =
          temp !== ""
            ? temp +
              " / " +
              mapItem.sub_type.filter(
                (item) => item.id === mapItem.selectedIndex
              )[0].name
            : " / " +
              mapItem.sub_type.filter(
                (item) => item.id === mapItem.selectedIndex
              )[0].name;
      }
    });
    return temp;
  }, [modificationTypeArray]);

  const filterModalItem = (item) => {
    // console.log("menuItem ==>", menuItem);
    // console.log("item.modifiers ==>", item);

    if (item.modifier_type !== "") {
      setModifierItem(item);
      const data = JSON.parse(item.modifiers);

      const result = [];
      const groupedData = data.reduce((acc, item) => {
        if (!acc[item.sub_type]) {
          acc[item.sub_type] = [];
        }
        acc[item.sub_type].push(item);
        return acc;
      }, {});

      for (const subType in groupedData) {
        result.push({
          sub_type_name: subType,
          sub_type: groupedData[subType],
        });
      }
      // console.log("result ===>", JSON.stringify(result));
      setModificationTypeArray([...result]);
      setItemModificationModal(true);
    }
    // else {
    //   Alert.alert("Modifier type is not found");
    // }
  };

  const itemCount = useMemo(() => {
    const latestQuantity = getQuantity(modifierItem, cartState.cartItems);
    setQuantity(latestQuantity);

    return latestQuantity;
  }, [cartState.itemCount, itemModificationModal]);

  const pluseQuantity = () => {
    setModifierItemQnt(modifierItemQnt + 1);
  };

  const handleDecrease = () => {
    if (modifierItemQnt >= 1) {
      setModifierItemQnt(modifierItemQnt - 1);
    }
  };

  const modifierTimeArray = (existingTimeArray, quantity) => {
    // console.log("quantity ::;", quantity);
    // console.log("existingTimeArray ::;", existingTimeArray);
    let timeArray = [];
    const createdTime = new Date();
    if (existingTimeArray !== undefined) {
      timeArray = [...existingTimeArray];
      for (let i = 0; i < quantity; i++) {
        timeArray.push({ updatedTime: createdTime });
      }
    } else {
      for (let i = 0; i < quantity; i++) {
        timeArray.push({ updatedTime: createdTime });
      }
    }
    // console.log("timeArray===>", timeArray);
    return timeArray;
  };

  const placeOrder = () => {
    const selectedIndexArray = modificationTypeArray.map(
      (item) => item.selectedIndex
    );
    // console.log("selectedIndexArray ::::", selectedIndexArray);
    const modifiesArray = JSON.parse(modifierItem.modifiers);
    const filteredData = modifiesArray.filter((item) =>
      selectedIndexArray.includes(item.id)
    );

    let modifierKey = filteredData.map((item) => item.name).join("/");

    let updatedPayload = {};
    let isModofierExist = false;
    const modifier_key = getModifierKey(modifierKey, cartState.cartItems);
    // console.log("quantity ==================::::>", quantity);
    let updatedTime = modifierTimeArray(
      modifier_key?.modifyTime,
      modifierItemQnt
    );
    // console.log("updatedTime ==================::::>", updatedTime);

    if (quantity) {
      // console.log("modifierKey :::", modifierKey);
      if (modifier_key) {
        // console.log("modifier_key =========>", modifier_key.modifierKey);
        // console.log("isModofierExist =========>", modifier_key.isModofierExist);
        modifier_key.quantity = modifier_key.quantity + modifierItemQnt;
        modifier_key.modifyTime = updatedTime;
        if (modifier_key.isModofierExist) {
          updatedPayload = { ...modifier_key };
        } else {
          updatedPayload = { ...modifier_key, isModofierExist: true };
        }
        isModofierExist = true;
      }
      if (!isModofierExist) {
        updatedPayload = {
          ...modifierItem,
          modifiers_update: filteredData,
          isModifier: true,
          quantity: modifierItemQnt,
          modifierKey: modifierKey,
          modifyTime: updatedTime,
        };
      }
    } else {
      updatedPayload = {
        ...modifierItem,
        modifiers_update: filteredData,
        isModifier: true,
        quantity: modifierItemQnt,
        modifierKey: modifierKey,
        modifyTime: updatedTime,
      };
    }

    // console.log("updatedPayload ====>", updatedPayload);
    const payload = { updatedPayload: updatedPayload, isAllModifier: true };

    // console.log("placeOrder payload ====>", payload);
    dispatch({ type: "ADD_ITEM", payload });
    setItemModificationModal(false);
  };

  const getFirstItemById = (array, targetId) => {
    const index = array.findIndex((item) => item.id === targetId);
    if (index !== -1) {
      return array[index];
    }
    return null;
  };

  const decresModifierItem = (item) => {
    let payload;
    let decreasingOrderData = DecreasingOrderData(cartState.cartItems);
    // console.log(
    //   "decreasingOrderData ::::",
    //   JSON.stringify(decreasingOrderData)
    // );
    if (decreasingOrderData.length > 0) {
      const filterItem = getFirstItemById(decreasingOrderData, item.id);
      const indexOfFilterItem = decreasingOrderData.indexOf(filterItem);
      let modifierTimeArray = [];
      if (filterItem.modifyTime.length > 0) {
        filterItem.modifyTime.map((mapItem, mapIndex) => {
          if (filterItem.modifyTime.length - 1 !== mapIndex) {
            modifierTimeArray.push(mapItem);
          }
        });
      }
      // console.log("filterItem.quantity ::::", modifierTimeArray);
      if (filterItem.quantity > 1) {
        payload = {
          data: filterItem,
          modifierTimeArray: modifierTimeArray,
        };
        decrease(payload);
      } else if (filterItem.quantity === 1) {
        payload = decreasingOrderData.filter(
          (deletItem) => deletItem.modifierKey !== filterItem.modifierKey
        );
        // console.log("rewmove ::::", payload);
        removeItem(payload);
      }
    }
  };

  const modify_renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          selectedModifiactionType(item);
        }}
        style={{
          backgroundColor: modificationTypeArray[modifyTypeIndex].selectedIndex
            ? modificationTypeArray[modifyTypeIndex].selectedIndex === item.id
              ? "red"
              : theme["background-basic-color-2"]
            : theme["background-basic-color-2"],
          borderRadius: 4,
          borderWidth: 2,
          borderColor: modificationTypeArray[modifyTypeIndex].selectedIndex
            ? modificationTypeArray[modifyTypeIndex].selectedIndex === item.id
              ? theme["color-basic-700"]
              : theme["color-basic-200"]
            : theme["color-basic-200"],
          width: NormalisedSizes(270),
          height: NormalisedSizes(100),
          paddingHorizontal: NormalisedSizes(6.5),
          paddingVertical: NormalisedSizes(12),
          borderStyle: "solid",
          justifyContent: "center",
          alignItems: "center",
          marginVertical: NormalisedSizes(5),
          marginHorizontal: NormalisedSizes(5),
          marginLeft: NormalisedSizes(10),
        }}
      >
        <Label
          variantStyle="regular"
          buttonLabel="LabelLargeBtn"
          style={{
            textAlign: "center",
            color: modificationTypeArray[modifyTypeIndex].selectedIndex
              ? modificationTypeArray[modifyTypeIndex].selectedIndex === item.id
                ? "white"
                : theme["color-basic-700"]
              : theme["color-basic-700"],
            marginBottom: NormalisedSizes(5),
            width: "100%",
          }}
        >
          {item.name}
        </Label>
        {item?.additional_price / 100 > 0 && (
          <Label
            variantStyle="regular"
            buttonLabel="LabelLargeBtn"
            appearance="hint"
            style={{
              color: modificationTypeArray[modifyTypeIndex].selectedIndex
                ? modificationTypeArray[modifyTypeIndex].selectedIndex ===
                  item.id
                  ? "white"
                  : theme["color-basic-500"]
                : theme["color-basic-500"],
            }}
          >
            {formatNumber(item?.additional_price)}
          </Label>
        )}
      </TouchableOpacity>
    );
  };

  const next = (key) => {
    let data = modificationTypeArray;
    if (!data[modifyTypeIndex].selectedIndex) {
      Alert.alert("Please select at least one option.");
    } else {
      if (key === "placeOrder") {
        placeOrder();
      } else {
        setSelectModificationtype("");
        setModifyTypeIndex(modifyTypeIndex + 1);
      }
    }
  };

  const decresPriceModifierAction = (item) => {
    let decreasingOrderData = DecreasingOrderData(cartState.cartItems);

    if (decreasingOrderData.length > 0) {
      const priceModifierFilterItem = getFirstItemById(
        decreasingOrderData,
        item.id
      );
      let modifierTimeArray = [];
      if (priceModifierFilterItem.modifyTime.length > 0) {
        priceModifierFilterItem.modifyTime.map(
          (mapItem, mapIndex) => {
          if (
              priceModifierFilterItem.modifyTime.length - 1 !==
              mapIndex
            ) {
            modifierTimeArray.push(mapItem);
          }
        }
        );
      }
      if (priceModifierFilterItem.quantity > 1) {
        payload = {
          data: priceModifierFilterItem,
          modifierTimeArray: modifierTimeArray,
        };
        decrease(payload);
      } else if (priceModifierFilterItem.quantity === 1) {
        payload = decreasingOrderData.filter(
          (deletItem) =>
            deletItem.variablePriceKey !==
            priceModifierFilterItem.variablePriceKey
        );
        removeItem(payload);
      }
    }
  };

  const priceModifierTimeArray = (existingTimeArray) => {
    let timeArray = [];
    const createdTime = new Date();
    if (existingTimeArray !== undefined) {
      timeArray = [...existingTimeArray];
      timeArray.push({ updatedTime: createdTime });
    } else {
      timeArray.push({ updatedTime: createdTime });
    }
    return timeArray;
  };

  const editVariablePrice = async () => {
    let payload;
    let newPriceKey = variablePriceItem?.id + variableItemPrice;
    const timeModifier_key = await getModifierPrice(
      newPriceKey,
      cartState.cartItems
    );

    let updatedTime = priceModifierTimeArray(
      timeModifier_key?.modifyTime
    );

    if (timeModifier_key) {
      payload = timeModifier_key;
      payload.modifyTime = updatedTime;
    } else {
      let new_payload = { ...variablePriceItem, modifiers_update: [] };
      new_payload.price = Number(variableItemPrice);

      payload = {
        ...new_payload,
        quantity: 1,
        modifyTime: updatedTime,
        variablePriceKey: newPriceKey,
      };
    }
    addItem(payload);
    setVariableItemPrice("");
    setOpenItemPriceModal(false);
  };

  const renderMenuItem = ({ item, index }) => {
    if (item.is_custom_item) {
      return (
        <Button
          onPress={addProduct}
          accessoryLeft={PlusOutlineIcon}
          status="tertiary"
          style={{
            marginLeft: NormalisedSizes(10),
            marginTop: index >= 3 ? NormalisedSizes(5) : 0,
            width: NormalisedSizes(320),
            height: NormalisedSizes(100),
            paddingRight: NormalisedSizes(10),
            paddingLeft: NormalisedSizes(10),
            paddingTop: NormalisedSizes(12),
            paddingBottom: NormalisedSizes(12),
            borderRadius: 4,
            borderWidth: 2,
          }}
        >
          Create Custom Item
        </Button>
      );
    }

    return (
      <MenuItem
        decresModifierItem={() => decresModifierItem(item)}
        decresPriceModifierItem={() => decresPriceModifierAction(item)}
        openVariablePriceModal={() => {
          setOpenItemPriceModal(true);
          setVariablePriceItem(item);
        }}
        openModificationModal={() => {
          filterModalItem(item);
          setModifyTypeIndex(0);
          setSelectModificationtype("");
          setModifierItemQnt(1);
        }}
        style={{
          marginLeft: index % 3 !== 0 ? NormalisedSizes(20) : 0,
          marginTop: index >= 3 ? NormalisedSizes(20) : 0,
        }}
        key={item?.id}
        item={item}
        handleFavoritePress={() => {
          handleFavoritePress(item, index);
        }}
        longPressToOpenModal={() => {
          setItemDetails(item);
          const upcArray = JSON.parse(item?.upc);
          if (isArray(upcArray)) {
            setUpcTags(upcArray);
          }
          setLongPressModal(true);
        }}
      />
    );
  };
  const handleInputChange = (text) => {
    let onlyNumbers = text.replace(/[^0-9]/g, "");

    // Convert the input to cents
    const newItemPrice = parseInt(onlyNumbers, 10);
    if (!isNaN(newItemPrice)) {
      setVariableItemPrice(newItemPrice);
    }
  };

  const handleUpcTagInput = (text) => {
    setUpcValue(text);
  };

  const addUpcTag = () => {
    if (upcValue.trim() !== "") {
      setUpcTags([...upcTags, upcValue.trim()]);
      setUpcValue("");
    }
  };

  const handleRemoveUpcTag = (index) => {
    const updatedTags = [...upcTags];
    updatedTags.splice(index, 1);
    setUpcTags([...updatedTags]);
  };

  const displayItemPrice = `$${(variableItemPrice / 100).toFixed(2)}`;
  return (
    <Block style={globalStyles.splitUI}>
      <Block style={globalStyles.splitMain}>
        {selectedMenu?.id ? (
          <>
            <TabBar
              selectedIndex={selectedCatIndex}
              onSelect={(index) => {
                getMenuItemList(index, categoryData, allMenuItems);
              }}
              appearance="noIndicator"
              style={{
                marginVertical: NormalisedSizes(20),
                marginLeft: 16,
                marginRight: 90,
              }}
            >
              {categoryData.map((item) => {
                return (
                  <Tab
                    key={item.cat_name}
                    title={(TextProps) => (
                      <Label
                        style={{
                          color: TextProps.style.color,
                          marginVertical: NormalisedSizes(
                            TextProps.style.marginVertical
                          ),
                          paddingHorizontal: NormalisedSizes(3),
                          paddingVertical: NormalisedSizes(12),
                        }}
                        variantStyle="uppercaseBold"
                        buttonLabel="LabelLargeBtn"
                      >
                        {item.cat_name}
                      </Label>
                    )}
                  />
                );
              })}
            </TabBar>

            <View style={globalStyles.categoryContainer} />
            {menuItem.length !== 0 ? (
              <View
                style={[
                  globalStyles.menuItemsContainer,
                  { marginLeft: NormalisedSizes(7) },
                ]}
              >
                {selectedCatIndex !== undefined && menuItem.length !== 0 && (
                  <FlatList
                    data={menuItem}
                    renderItem={renderMenuItem}
                    numColumns={3}
                    nestedScrollEnabled
                    initialNumToRender={10}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
            ) : (
              <ScrollView>
                <Subtitle style={{ margin: NormalisedSizes(20) }}>
                  Please Choose A Location And Menu To Display Menu Items
                </Subtitle>
              </ScrollView>
            )}
            <View
              style={{
                height: 70,
                alignItems: "flex-end",
                justifyContent: "center",
                width: NormalisedSizes(1000),
              }}
            >
              <TouchableOpacity
                onPress={() => animationButton()}
                style={{
                  backgroundColor: "lightgrey",
                  padding: 10,
                  borderRadius: 5,
                }}
              >
                <Image
                  source={showSearchModal ? Images.close : Images.search}
                  style={{ width: 30, height: 30 }}
                />
              </TouchableOpacity>
              <Animated.View
                pointerEvents="box-none"
                style={[
                  style.animatedView,
                  {
                    width: animation,
                    transform: [
                      {
                        translateX: animation.interpolate({
                          inputRange: [0, 1000],
                          outputRange: [
                            Dimensions.get("window").width / 1.7,
                            0,
                          ],
                          extrapolateRight: "identity",
                        }),
                      },
                    ],
                  },
                ]}
              >
                {showSearchModal && (
                  <TextInput
                    style={style.textInpute}
                    keyboardType="web-search"
                    placeholderTextColor={"grey"}
                    placeholder="Search"
                    onChangeText={(text) => setSearchText(text)}
                    // onSubmitEditing={() => searchMenuItem()}
                  />
                )}
              </Animated.View>
            </View>
          </>
        ) : (
          <Block margin={NormalisedSizes(32)}>
            <Subtitle>Please Select a Menu And Location</Subtitle>
          </Block>
        )}
      </Block>
      <Block style={{ flex: 0.5, alignItems: "flex-end" }}>
        <OrderPanel />
      </Block>
      <Modal
        visible={upcModalOpen}
        transparent={true}
        onRequestClose={() => setUpcModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              position: "absolute",
              backgroundColor: "rgba(0,0,0,0.2)",
              width: "100%",
              height: "100%",
            }}
          />
          <View
            style={{
              backgroundColor: "white",
              alignSelf: "center",
              padding: 15,
              borderRadius: 5,
              height:
                SCREEN_HEIGHT -
                SCREEN_HEIGHT * (upcTags.length > 0 ? 0.4 : 0.55),
              width: SCREEN_WIDTH * 0.4,
            }}
          >
            <ModalHeaderTitle
              onclose={() => setUpcModalOpen(false)}
              title="Associate UPC"
            />

            <View style={{ marginHorizontal: 30, marginVertical: 20 }}>
              <Heading variants="h5" style={{ marginBottom: 10 }}>
                {itemDetails.name} ({formatNumber(itemDetails.price)})
              </Heading>
              <Heading variants="h5" style={{ marginBottom: 10 }}>
                UPC :
              </Heading>
              <Input
                keyboardType="default"
                disableFullscreenUI
                autoFocus
                autoCapitalize={"characters"}
                value={upcValue}
                onChangeText={(text) => {
                  handleUpcTagInput(text);
                }}
                placeholder=""
                size="large"
                textStyle={{
                  fontSize: NormalisedFonts(21),
                  lineHeight: NormalisedFonts(30),
                  fontWeight: "400",
                  fontFamily: "OpenSans-Regular",
                }}
                onSubmitEditing={() => {
                  if (upcValue !== "") {
                    addUpcTag();
                  } else {
                    alert("Please enter UPC value.");
                  }
                }}
              />
              <ScrollView
                style={{ height: upcTags.length > 0 ? 100 : 0 }}
                showsVerticalScrollIndicator={false}
              >
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  {upcTags.map((tag, index) => (
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        margin: 3,
                        backgroundColor: "lightgrey",
                        borderRadius: 5,
                        paddingVertical: 2,
                        paddingHorizontal: 7,
                        maxWidth: 200,
                      }}
                      key={index}
                      onPress={() => handleRemoveUpcTag(index)}
                    >
                      <Text numberOfLines={2} style={style.tag}>
                        {tag}
                      </Text>
                      <Image
                        source={Images.close}
                        style={{ width: 15, height: 15 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                marginHorizontal: 13,
              }}
            >
              <ButtonExtended
                size="medium"
                status="secondary"
                style={{ width: NormalisedSizes(190), marginHorizontal: 5 }}
                onPress={() => {
                  setUpcModalOpen(false);
                  setUpcTags([]), setUpcValue("");
                }}
              >
                <Label
                  buttonLabel="LabelLargeBtn"
                  variants="label"
                  variantStyle="uppercaseBold"
                >
                  CANCEL
                </Label>
              </ButtonExtended>
              <ButtonExtended
                size="medium"
                status="primary"
                disabled={!upcTags.length}
                style={{ width: NormalisedSizes(190), marginHorizontal: 5 }}
                onPress={() => updateUpc()}
              >
                {!upcloader ? (
                  <Label
                    buttonLabel="LabelLargeBtn"
                    variants="label"
                    variantStyle="uppercaseBold"
                  >
                    SUBMIT
                  </Label>
                ) : (
                  <ActivityIndicator color={"#FFFFFF"} />
                )}
              </ButtonExtended>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={longPressModal}
        transparent={true}
        onRequestClose={() => setLongPressModal(false)}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              position: "absolute",
              backgroundColor: "rgba(0,0,0,0.2)",
              width: "100%",
              height: "100%",
            }}
          />
          <View
            style={{
              backgroundColor: "white",
              alignSelf: "center",
              padding: 15,
              borderRadius: 5,
              height: SCREEN_HEIGHT - SCREEN_HEIGHT * 0.8,
              width: SCREEN_WIDTH * 0.4,
            }}
          >
            <ModalHeaderTitle
              onclose={() => setLongPressModal(false)}
              title={itemDetails?.name + " " + formatNumber(itemDetails?.price)}
            />
            <View
              style={{
                alignItems: "flex-start",
                marginTop: 12,
                marginLeft: 5,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setUpcModalOpen(true), setUpcValue("");
                }}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Image
                  source={Images.qrCodeScanner}
                  style={{ width: 25, height: 25, marginRight: 10 }}
                />
                <Text style={{ fontSize: 20 }}>Associate UPC</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ConfirmationModal
        visible={visible}
        setVisible={() => setVisible(false)}
        fromOverflow={false}
      />
      <Modal
        visible={itemModificationModal}
        transparent
        onRequestClose={() => setItemModificationModal(false)}
      >
        <View style={style.mainView}>
          <View style={style.backgroundView} />
          <View style={style.modalView}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={() => setItemModificationModal(false)}
                style={{ flex: 0.05, justifyContent: "flex-end" }}
              >
                <Image
                  source={Images.close}
                  style={{ width: 20, height: 20 }}
                />
              </TouchableOpacity>
              <View
                style={{
                  flex: 1.3,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Label
                  style={{ textAlign: "center" }}
                  variants={undefined}
                  variantStyle={undefined}
                  buttonLabel={undefined}
                >
                  {modifierItem?.name
                    ? capitalizedString(modifierItem?.name)
                    : ""}{" "}
                  {getSelectedModifier()}
                </Label>
                <Subtitle variants="s2" variantStyle={undefined}>
                  Choose a {capitalizeFirstLetter(modifierItem?.modifier_type)}{" "}
                  {capitalizeFirstLetter(
                    modificationTypeArray[modifyTypeIndex]?.sub_type_name
                  )}
                </Subtitle>
              </View>
              <View style={{ flex: 0.05 }} />
            </View>
            <View style={{ flex: 1 }}>
              <FlatList
                data={modificationTypeArray[modifyTypeIndex].sub_type}
                renderItem={modify_renderItem}
                numColumns={3}
                contentContainerStyle={{ margin: 15 }}
              />
            </View>
            <View style={style.footerView}>
              <View style={style.footerFirstView}>
                <Flex
                  width={NormalisedSizes(127)}
                  flexDirection="row"
                  alignContent="center"
                  justifyContent="center"
                  style={{ marginRight: NormalisedSizes(32) }}
                >
                  <Block
                    style={{
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      accessoryLeft={PlusOutlineIcon}
                      status="secondary"
                      style={{
                        borderRadius: 50,
                        padding: 0,
                        marginHorizontal: 15,
                        width: NormalisedSizes(40),
                        height: NormalisedSizes(40),
                      }}
                      size="small"
                      onPress={() => pluseQuantity()}
                    />
                  </Block>
                  <Block
                    style={{
                      paddingHorizontal: NormalisedSizes(9),
                      justifyContent: "center",
                    }}
                  >
                    <Subtitle variants="s2" variantStyle="semiBold">
                      {modifierItemQnt ?? 0}
                    </Subtitle>
                  </Block>
                  <Block
                    style={{
                      justifyContent: "center",
                    }}
                  >
                    {modifierItemQnt > 1 && (
                      <Button
                        accessoryLeft={MinusOutlineIcon}
                        size="small"
                        onPress={() => handleDecrease()}
                        style={{
                          borderRadius: 50,
                          paddingHorizontal: 0,
                          paddingVertical: 0,
                          marginVertical: 0,
                          marginHorizontal: 10,
                          width: NormalisedSizes(40),
                          height: NormalisedSizes(40),
                        }}
                      />
                    )}
                  </Block>
                </Flex>
              </View>
              <View style={style.footerFirstView}>
                <TouchableOpacity
                  onPress={() => {
                    if (modifyTypeIndex > 0) {
                      setModifyTypeIndex(modifyTypeIndex - 1);
                    } else {
                      setItemModificationModal(false);
                    }
                  }}
                  style={[
                    style.nextButton,
                    {
                      backgroundColor: "#D3D3D3",
                    },
                  ]}
                >
                  <Text style={{ fontSize: 18, color: "black" }}>
                    {modifyTypeIndex > 0 ? "Previous" : "Close"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (modifyTypeIndex < modificationTypeArray.length - 1) {
                      next("next");
                    } else {
                      next("placeOrder");
                      // if (selectModificationtype === "") {
                      //   Alert.alert("Please select at lease one option.");
                      // } else {
                      //   placeOrder();
                      // }
                    }
                  }}
                  style={[
                    style.nextButton,
                    {
                      backgroundColor: "#FF1701",
                    },
                  ]}
                >
                  <Text style={{ fontSize: 18, color: "white" }}>
                    {modifyTypeIndex < modificationTypeArray.length - 1
                      ? "Next"
                      : "Add Item"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={openItemPriceModal}
        transparent
        onRequestClose={() => {
          setOpenItemPriceModal(false), setVariableItemPrice("");
        }}
      >
        <View style={style.mainView}>
          <View style={style.backgroundView} />
          <View style={style.priceEditmodalView}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setOpenItemPriceModal(false), setVariableItemPrice("");
                }}
                style={{ flex: 0.05, justifyContent: "flex-end" }}
              >
                <Image
                  source={Images.close}
                  style={{ width: 20, height: 20 }}
                />
              </TouchableOpacity>
              <View
                style={{
                  flex: 1.3,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Label
                  style={{ textAlign: "center" }}
                  variants={undefined}
                  variantStyle={undefined}
                  buttonLabel={undefined}
                >
                  Custom Price for {variablePriceItem?.name}
                </Label>
              </View>

              <View style={{ flex: 0.05 }} />
            </View>
            <TextInput
              keyboardType="numeric"
              disableFullscreenUI
              autoFocus
              size="large"
              style={style.textInpute}
              placeholderTextColor={"grey"}
              placeholder="$0.00"
              value={displayItemPrice}
              onChangeText={handleInputChange}
            />
            <Block
              style={{
                marginHorizontal: NormalisedSizes(25),
                marginTop: NormalisedSizes(7),
              }}
            >
              <ButtonExtended
                onPress={() => editVariablePrice()}
                status="primary"
                size="giant"
              >
                <Label
                  buttonLabel="LabelGiantBtn"
                  variants="label"
                  variantStyle="uppercaseBold"
                >
                  Apply Custom Price
                </Label>
              </ButtonExtended>
            </Block>
          </View>
        </View>
      </Modal>
    </Block>
  );
};

const style = StyleSheet.create({
  animatedView: {
    position: "absolute",
    left: 0,
    top: 7,
    right: 0,
    bottom: 0,
    height: 55,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
    backgroundColor: "white",
  },
  textInpute: {
    borderWidth: 2,
    borderColor: "grey",
    margin: 20,
    borderRadius: 5,
    paddingHorizontal: 20,
    fontSize: 20,
    color: "black",
    marginVertical: 20,
  },

  // MAINVIEW

  mainView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { fontSize: 20, textAlign: "center" },
  backgroundView: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.2)",
    width: "100%",
    height: "100%",
  },
  modalView: {
    backgroundColor: "white",
    alignSelf: "center",
    padding: 15,
    borderRadius: 5,
    height: SCREEN_HEIGHT - SCREEN_HEIGHT * 0.4,
    width: SCREEN_WIDTH * 0.74,
  },
  footerView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerFirstView: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  nextButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5,
    width: "40%",
  },
  priceEditmodalView: {
    backgroundColor: "white",
    alignSelf: "center",
    padding: 15,
    borderRadius: 5,
    height: SCREEN_HEIGHT - SCREEN_HEIGHT * 0.64,
    width: SCREEN_WIDTH * 0.4,
  },
  tag: {
    marginRight: 3,
    maxWidth: 170,
    color: "black",
  },
});
