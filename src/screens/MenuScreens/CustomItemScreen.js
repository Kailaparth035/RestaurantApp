import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigation } from "@react-navigation/native";
import { Input } from "@ui-kitten/components";
import React, { useContext, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import * as yup from "yup";
import { ButtonExtended } from "../../components/atoms/Button/Button";
import { Heading, Label } from "../../components/atoms/Text";
import { Block } from "../../components/layouts/block";
import { Box } from "../../components/layouts/BoxContainer";
import { Flex } from "../../components/layouts/flex";
import { useDispatch } from "../../contexts/CustomItemsProvider";
import { NormalisedSizes } from "../../hooks/Normalized";
import TaxDropDown from "../../components/organisms/TaxDropDown/TaxDropDown";
import { AuthContext } from "../../contexts/AuthContext";
import { useApolloClient } from "@apollo/client";
import { CREATE_ITEM, UPDATE_MENU_CATEGORY } from "../../fragments/resolvers";
import { Spinner } from "@ui-kitten/components";
import { WriteLog } from "../../../src/CommonLogFile";
import { KEY_NAME, SYNC_STATUS_VERIFY } from "../../../src/helpers/constants";
import {
  deleteCachedItem,
  getCachedItem,
} from "../../../src/helpers/storeData";

const schema = yup
  .object({
    productName: yup.string().required(),
    description: yup.string().required(),
    price: yup.number().integer().positive().required(),
  })
  .required();

const permenantschema = yup
  .object({
    productName: yup.string().required(),
    receiptName: yup.string().required(),
    description: yup.string().required(),
    productType: yup.string().required(),
    price: yup.number().integer().positive().required(),
    tax: yup.number().required(),
  })
  .required();

export function CustomItemScreen(props) {
  const client = useApolloClient();
  const [permanentItem, setPermanentItem] = useState(false);
  const [selectedTextype, setSelectedTextype] = useState("");
  const [taxpercentage, setTaxpercentage] = useState("");
  const [itemLoding, setItemLoading] = useState(false);
  const [taxpercentageError, setTaxpercentageError] = useState("");
  const navigation = useNavigation();
  const {
    tabletSelections: { event: selectedEvent, location: selectedLocation },
    syncLocationsMenusMenuItems,
    menuDisplayRefresh,
    setMenuDisplayRefresh,
  } = useContext(AuthContext);

  const ref_name = useRef();
  const ref_description = useRef();
  const ref_Price = useRef();
  const ref_recipt = useRef();
  const ref_category = useRef();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productName: "",
      description: "",
      price: 0,
      tags: ["custom"],
      categoryId: props.route.params.categoryId,
      receiptName: "",
      productType: "",
      tax: 0,
    },
    resolver: yupResolver(permanentItem ? permenantschema : schema),
  });
  const dispatch = useDispatch();

  const onSubmit = (data) => {
    // WriteLog("CustomeItem Screen SUBMITTED " + data);
    // console.log("SUBMITTED", data);
    if (selectedTextype.id === 1 && !taxpercentage) {
      setTaxpercentageError(true);
    } else {
      setTaxpercentageError(false);
      data.short_name = data.productName;
      let payload = {
        categoryId: 1,
        description: data.description,
        price: data.price,
        productName: data.productName,
        productType: data.productType,
        receiptName: data.receiptName,
        tags: data.tags,
        tax: selectedTextype.name,
        tax_percentage: selectedTextype.id === 1 ? taxpercentage : 0,
        is_variable_price: data.is_variable_price,
      };
      dispatch({ type: "ADD_PRODUCT", payload: payload });
      navigation.navigate("Menu");
    }
  };

  const permenantSubmit = async (data) => {
    if (selectedTextype.id === 1 && !taxpercentage) {
      setTaxpercentageError(true);
    } else {
      setItemLoading(true);
      let categoryData = props.route.params.categoryData;
      setTaxpercentageError(false);
      let tags = [];
      tags.push(data.productType);

      let input = {
        name: data.productName,
        is_active: true,
        short_name: data.productName,
        description: data.description,
        tags: tags,
        event_id: selectedEvent?.eventId,
        vendor_id: selectedLocation.vendor_id,
        price: data.price,
        tax: selectedTextype.id === 1 ? "taxed" : "no_tax",
        tax_percentage: selectedTextype.id === 1 ? taxpercentage : 0,
        is_variable_price: data.is_variable_price,
      };

      try {
        await client
          .mutate({
            mutation: CREATE_ITEM,
            variables: {
              input,
            },
          })
          .then(async (response) => {
            if (response.data.insert_items_one !== null) {
              if (data.categoryId === 1) {
                categoryData.cat_1_itemsIds.push(
                  JSON.stringify(response.data.insert_items_one.id)
                );
              } else if (data.categoryId === 2) {
                categoryData.cat_2_itemsIds.push(
                  JSON.stringify(response.data.insert_items_one.id)
                );
              } else if (data.categoryId === 3) {
                categoryData.cat_3_itemsIds.push(
                  JSON.stringify(response.data.insert_items_one.id)
                );
              } else if (data.categoryId === 4) {
                categoryData.cat_4_itemsIds.push(
                  JSON.stringify(response.data.insert_items_one.id)
                );
              } else if (data.categoryId === 5) {
                categoryData.cat_5_itemsIds.push(
                  JSON.stringify(response.data.insert_items_one.id)
                );
              } else if (data.categoryId === 6) {
                categoryData.cat_6_itemsIds.push(
                  JSON.stringify(response.data.insert_items_one.id)
                );
              }

              await client
                .mutate({
                  mutation: UPDATE_MENU_CATEGORY,
                  variables: {
                    id: props.route.params.menu_id,
                    input: { category: categoryData },
                  },
                })
                .then(async (updateMenuresponse) => {
                  if (updateMenuresponse.data.update_menus_by_pk !== null) {
                    await refreshLocationMenu(
                      selectedEvent?.eventId,
                      false,
                      true
                    );
                  } else {
                    alert("Menudata is not updated");
                  }
                })
                .catch((error) => {
                  alert("Something went wrong");
                  console.log("error :::", error);
                });
            }
          })
          .catch((error) => {
            alert("Item is not created");
          });
      } catch (error) {
        console.log("error :::", error);
      }
    }
  };

  const taxType = [
    {
      name: "TAXED",
      id: 1,
    },
    {
      name: "NO_TAX",
      id: 2,
    },
  ];

  const refreshLocationMenu = async () => {
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
      if (
        locations?.item !== null &&
        menus?.item !== null &&
        menuItems?.item !== null &&
        discounts?.item !== null
      ) {
        syncStatus = false;
      } else {
        syncStatus = true;
      }
    };

    const intervalId = setInterval(() => {
      if (syncStatus) {
        fetchData();
      } else {
        clearInterval(intervalId);
        setTimeout(() => {
          setMenuDisplayRefresh(menuDisplayRefresh + 1);
          setItemLoading(false);
          navigation.goBack();
        }, 2000);
      }
    }, SYNC_STATUS_VERIFY);
  };

  return (
    <ScrollView>
      <Box>
        <Box
          style={{
            marginRight: NormalisedSizes(32),
            marginLeft: NormalisedSizes(32),
          }}
        >
          <Block
          // style={{
          //   marginRight: "auto",
          //   marginLeft: "auto",
          // }}
          // width={NormalisedSizes(496)}
          >
            <Flex flexDirection="column" alignItems="stretch">
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  marginTop: NormalisedSizes(48),
                  marginBottom: NormalisedSizes(32),
                }}
              >
                <Heading
                  style={{
                    textAlign: "center",
                    marginLeft: permanentItem
                      ? NormalisedSizes(393)
                      : NormalisedSizes(380),
                  }}
                  variants="h2"
                >
                  {permanentItem
                    ? "Create Permanent Item"
                    : "Create One-Time Use Item"}
                </Heading>
                <ButtonExtended
                  onPress={() => setPermanentItem(!permanentItem)}
                  size="giant"
                  status={permanentItem ? "" : "secondary"}
                >
                  <Label buttonLabel="LabelGiantBtn">Permanent Item</Label>
                </ButtonExtended>
              </View>

              <Box
                style={{
                  marginTop: NormalisedSizes(16),
                  marginBottom: NormalisedSizes(16),
                  alignItems: "center",
                }}
              >
                <Block style={styles.containerGap}>
                  <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        placeholder={
                          permanentItem ? "Enter POS Name" : "Enter Item Name"
                        }
                        size="large"
                        style={styles.input}
                        onBlur={onBlur}
                        rules={{ required: true }}
                        onChangeText={(value) => onChange(value)}
                        value={value}
                        ref={ref_name}
                        onSubmitEditing={() => {
                          permanentItem
                            ? ref_recipt.current.focus()
                            : ref_description.current.focus();
                        }}
                        blurOnSubmit={false}
                      />
                    )}
                    name="productName"
                  />
                  {errors.productName ? (
                    <Label style={styles.errorText}>
                      {errors.productName.message}
                    </Label>
                  ) : null}
                </Block>

                {permanentItem && (
                  <Block style={styles.containerGap}>
                    <Controller
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          placeholder="Enter Receipt Name"
                          size="large"
                          style={styles.input}
                          onBlur={onBlur}
                          rules={{ required: true }}
                          onChangeText={(value) => onChange(value)}
                          value={value}
                          ref={ref_recipt}
                          onSubmitEditing={() => {
                            ref_description.current.focus();
                          }}
                          blurOnSubmit={false}
                        />
                      )}
                      name="receiptName"
                    />
                    {errors.receiptName ? (
                      <Label style={styles.errorText}>
                        {errors.receiptName.message}
                      </Label>
                    ) : null}
                  </Block>
                )}

                <Block style={styles.containerGap}>
                  <Controller
                    control={control}
                    rules={{
                      maxLength: 100,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        placeholder="Enter Description"
                        size="large"
                        style={styles.input}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        ref={ref_description}
                        onSubmitEditing={() => {
                          permanentItem
                            ? ref_category.current.focus()
                            : ref_Price.current.focus();
                        }}
                        blurOnSubmit={false}
                      />
                    )}
                    name="description"
                  />
                  {errors.description ? (
                    <Label style={styles.errorText}>
                      {errors.description.message}
                    </Label>
                  ) : null}
                </Block>

                {permanentItem && (
                  <Block style={styles.containerGap}>
                    <Controller
                      control={control}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          placeholder="Enter Item Category"
                          size="large"
                          style={styles.input}
                          onBlur={onBlur}
                          rules={{ required: true }}
                          onChangeText={(value) => onChange(value)}
                          value={value}
                          ref={ref_category}
                          onSubmitEditing={() => {
                            ref_Price.current.focus();
                          }}
                          blurOnSubmit={false}
                        />
                      )}
                      name="productType"
                    />
                    {errors.productType ? (
                      <Label style={styles.errorText}>
                        {errors.productType.message}
                      </Label>
                    ) : null}
                  </Block>
                )}

                <Block style={styles.containerGap}>
                  <Controller
                    control={control}
                    rules={{
                      maxLength: 3,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        placeholder="Enter Price"
                        size="large"
                        style={styles.input}
                        onBlur={onBlur}
                        onChangeText={(value) => onChange(value * 100)}
                        value={value}
                        keyboardType="numeric"
                        ref={ref_Price}
                      />
                    )}
                    name="price"
                  />
                  {errors.price ? (
                    <Label style={styles.errorText}>
                      {errors.price.message}
                    </Label>
                  ) : null}
                </Block>

                <Block style={{ width: NormalisedSizes(496) }}>
                  <TaxDropDown
                    taxType={taxType}
                    setSelectedTextype={(val) => {
                      // console.log("selectedTextType ::", val),
                      setSelectedTextype(taxType[val.row]);
                    }}
                    selectedTaxType={selectedTextype.name}
                  />
                </Block>

                {selectedTextype !== "" ? (
                  selectedTextype.name === "TAXED" ? (
                    <Block style={styles.containerGap}>
                      <Input
                        placeholder="Enter Tax % (as a decimal)"
                        size="large"
                        // style={styles.input}
                        onChangeText={(value) => {
                          setTaxpercentage(value), setTaxpercentageError(false);
                        }}
                        value={taxpercentage}
                        keyboardType="numeric"
                      />
                      {taxpercentageError ? (
                        <Label style={styles.errorText}>Plese Enter Tex</Label>
                      ) : null}
                    </Block>
                  ) : null
                ) : null}
              </Box>

              <Block
                style={{
                  marginTop: NormalisedSizes(16),
                  marginBottom: NormalisedSizes(32),
                  width: NormalisedSizes(496),
                  alignSelf: "center",
                }}
              >
                {itemLoding ? (
                  <ButtonExtended
                    status="basic"
                    size="giant"
                    style={{ marginBottom: 10 }}
                  >
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
                    onPress={
                      permanentItem
                        ? handleSubmit(permenantSubmit)
                        : handleSubmit(onSubmit)
                    }
                    disabled={!selectedTextype}
                    size="giant"
                    style={{ marginBottom: 10 }}
                  >
                    <Label buttonLabel="LabelGiantBtn">Submit</Label>
                  </ButtonExtended>
                )}
                <ButtonExtended
                  onPress={() => navigation.navigate("Menu")}
                  size="giant"
                  status="secondary"
                >
                  <Label buttonLabel="LabelGiantBtn">Cancel</Label>
                </ButtonExtended>
              </Block>
            </Flex>
          </Block>
        </Box>
      </Box>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  containerGap: {
    marginBottom: NormalisedSizes(16),
    marginTop: NormalisedSizes(16),
    width: NormalisedSizes(496),
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 5,
  },
  errorText: {
    color: "red",
  },
});
