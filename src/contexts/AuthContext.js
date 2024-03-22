/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-unused-vars */
/* eslint-disable radix */
/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable no-shadow */
import { Q } from "@nozbe/watermelondb";
import { useMutation } from "@apollo/client";
import { useDatabase } from "@nozbe/watermelondb/hooks";
import jwt_decode from "jwt-decode";
import React, { createContext, useEffect, useState } from "react";
import { SignInQuery } from "../fragments/LoginMutation";
import { useNetInfo } from "@react-native-community/netinfo";
import ACModule from "../services/ACService";
import RoninChipModule from "../services/RoninChipService";
import NewSyncService from "../services/new_sync/newSyncService";
import {
  deleteCachedItem,
  getCachedItem,
  setCachedItem,
} from "../../src/helpers/storeData";
import { KEY_NAME } from "../../src/helpers/constants";
import bcrypt from 'bcryptjs'

export const AuthContext = createContext();
const extractUserFromAccessToken = (accessToken) => {
  const decodedJWT = jwt_decode(accessToken);
  const user = {
    username: decodedJWT["https://hasura.io/jwt/claims"]["x-hasura-user-name"],
    user_id: decodedJWT["https://hasura.io/jwt/claims"]["x-hasura-user-id"],
    organization_id:
      decodedJWT["https://hasura.io/jwt/claims"][
      "x-hasura-user-organization-id"
      ],
    allowed_roles:
      decodedJWT["https://hasura.io/jwt/claims"]["x-hasura-default-role"],
    tablet_access_code: decodedJWT.tablet_access_code,
    accessTokenExp: decodedJWT.exp,
  };
  return user;
};

const initialTabletSelectionsState = {
  organizerId: null,
  event: {},
  location: {},
  menu: null,
};

export function AuthContextProvider({ children }) {
  const [organizerUser, setOrganizerUser] = useState({});
  const [employeeUser, setEmployeeUser] = useState({});
  const [syncService, setSyncService] = useState(null);
  const [offlineMode, updateOfflineMode] = useState(false);
  const [allowBatchMode, updateAllowBatchMode] = useState(true);
  const [orgConfig, setOrgConfig] = useState({});
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [refreshMenu, setRefreshMenu] = useState(false);
  const [skipOfflineSync, setSkipOfflineSync] = useState(false);
  const [tabletSelections, setTabletSelections] = useState(initialTabletSelectionsState);
  const initialProcessingMode = 'Dynamic Processing';
  const [processingMode, updateProcessingMode] = useState(initialProcessingMode)
  const [deviceId, setDeviceId] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [firmwareVersion, setFirmwareVersion] = useState("");
  const database = useDatabase();
  const netInfo = useNetInfo();
  const [login] = useMutation(SignInQuery);
  const [paymentTypeState, setPaymentTypeState] = useState("");
  const [eventIdState, setEventIdState] = useState(null);
  const [orgIdState, setOrgIdState] = useState(null);
  const [allowRecursive, setAllowRecursive] = useState(false);
  const [syncLogs, setSyncLogs] = useState([]);
  const [menuDisplayRefresh, setMenuDisplayRefresh] = useState(0)
  let orderSyncTimeoutIds = [];
  let attendeeRfidSyncTimeoutIds = [];
  const setOfflineMode = (mode) => {
    updateOfflineMode(mode);
  };
  const setProcessingMode = (flag) => {
    updateProcessingMode(flag);
  };
  const setAllowBatchMode = (flag) => {
    updateAllowBatchMode(flag);
  };
  const clearEmployeeUser = async () => {
    try {
      await deleteCachedItem(KEY_NAME.EMP_USER_ACCESS_TOKEN);
      await deleteCachedItem(KEY_NAME.SELECTED_LOCATION);
      await deleteCachedItem(KEY_NAME.SELECTED_MENU);
      setEmployeeUser({});
      updateTabletSelections({ location: {}, menu: null });
    } catch (error) { }
  };

  const loginEmployee = async ({ username, password }) => {
    try {
      const {
        data: {
          login: { accessToken },
        },
      } = await login({
        variables: {
          username,
          password,
        },
      });
      if (accessToken) {
        const cloudUser = extractUserFromAccessToken(accessToken);
        console.log("Cloud User", {cloudUser})
        await setCachedItem(KEY_NAME.EMP_USER_ACCESS_TOKEN, cloudUser.user_id);
        await updateEmployeeUser({ accessToken, orgUser: organizerUser });
        return { statusCode: 200 };
      }
    } catch (serverlessError) {
      if (serverlessError.networkError && !serverlessError.response) {
        return await localLogin({ username, password });
      }
      clearEmployeeUser();
      return {
        statusCode: 401,
        errorMessage: serverlessError.message || `Invalid "Password" or "Username".`,
      };
    }
    return await localLogin({ username, password });
  };

  const localLogin = async ({ username, password }) => {
    try {
      const user = await database.collections.get('users').query(Q.where('username', username)).fetch();
      if (user[0]) {
        const res = await bcrypt.compare(password, user[0]._raw.password_hash);
        if (res) {
          await setCachedItem(KEY_NAME.EMP_USER_ACCESS_TOKEN, user[0]._raw.user_id.toString());
          await updateLocalEmployeeUser(user[0]);
          return { statusCode: 200 };
        } else {
          clearEmployeeUser();
          return {
            statusCode: 401,
            errorMessage: `Invalid "Password" or "Username".`,
          };
        }
      } else {
        clearEmployeeUser();
        return {
          statusCode: 401,
          errorMessage: "Username not found locally.",
        };
      }
    } catch (error) {
      clearEmployeeUser();
      return {
        statusCode: 401,
        errorMessage: error.message || `Invalid "Password" or "Username".`,
      };
    }
  };

  const verifyEmployeeUserJWT = async ({ orgUser }) => {
    try {
      const { item: accessToken } = await getCachedItem(
        KEY_NAME.EMP_USER_ACCESS_TOKEN
      );
      //updateEmployeeUser({ accessToken, orgUser });
    } catch (error) {
      clearEmployeeUser();
    }
  };

  const updateLocalEmployeeUser = async (clerkUser) => {
    if (clerkUser) {
      try {
        const updatedEmployee = {
          username: clerkUser._raw.username,
          user_id: clerkUser._raw.user_id,
          organization_id: clerkUser._raw.organisation_id,
          allowed_roles: "clerk",
          tablet_access_code: clerkUser._raw.tablet_access_code,
          accessTokenExp: '',
        };
        setEmployeeUser(updatedEmployee);
      } catch (error) {
        clearEmployeeUser();
        throw error;
      }
    } else {
      clearEmployeeUser();
    }
  };

  const updateEmployeeUser = async ({ accessToken, eventId = null, orgUser }) => {
    if (accessToken) {
      try {
        const updatedEmployee = extractUserFromAccessToken(accessToken);
        const { accessTokenExp, allowed_roles, username } = updatedEmployee;
        if (Date.now() > accessTokenExp * 1000 || !allowed_roles.includes("clerk")) {
          clearEmployeeUser();
          throw new Error("Clerk Role is Required");
        }
        const orgId = Number(orgUser?.organization_id);
        setEmployeeUser(updatedEmployee);
        const newUser = {
          user_id: Number(updatedEmployee.user_id),
          organisation_id: orgId,
          username: updatedEmployee.username,
        };

        const isEmployee = await database.collections
          .get("users")
          .query(
            Q.where(
              "user_id",
              Q.eq(newUser.user_id),
              Q.where("organisation_id", Q.eq(newUser.organisation_id))
            )
          )
          .fetch();

        if (isEmployee.length === 0) {
          const users = database.collections.get("users");
          database.write(async () => {
            try {
              await users.create((record) => {
                record._raw = {
                  ...record._raw,
                  ...newUser,
                };
              });
            } catch (error) { }
          });
        }
      } catch (error) {
        clearEmployeeUser();
        throw error;
      }
    } else {
      clearEmployeeUser();
    }
  };


  const clearOrganizerUser = async () => {
    try {
      await deleteCachedItem(KEY_NAME.ORG_USER_ACCESS_TOKEN);
      await deleteCachedItem(KEY_NAME.ORG_ID);
      await deleteCachedItem(KEY_NAME.EVENT_ID);
      await deleteCachedItem(KEY_NAME.EMP_USER_ACCESS_TOKEN);
      await deleteCachedItem(KEY_NAME.USERS_SYNC);
      await deleteCachedItem(KEY_NAME.EVENTS_SYNC);
      await deleteCachedItem(KEY_NAME.DISCOUNTS_SYNC);
      await deleteCachedItem(KEY_NAME.LOCATIONS_SYNC);
      await deleteCachedItem(KEY_NAME.MENUS_SYNC);
      await deleteCachedItem(KEY_NAME.MENU_ITEMS_SYNC);
      await deleteCachedItem(KEY_NAME.ATTENDEES_SYNC);
      await deleteCachedItem(KEY_NAME.RFID_SYNC);
      await deleteCachedItem(KEY_NAME.SELECTED_LOCATION);
      await deleteCachedItem(KEY_NAME.SELECTED_MENU);

      //   const keys = await RNSensitiveInfo.getAllKeys();
      // await Promise.all(keys.map(key => deleteCachedItem(key)));
      setOrganizerUser({});
      clearEmployeeUser();
      setTabletSelections(initialTabletSelectionsState);

      try {
        await database.write(async () => {
          let localEvents = await database.collections.get("events").query().fetch();
          const deleteAllLocalEvents = localEvents.map((comment) =>
            comment.prepareDestroyPermanently()
          );
          database.batch(deleteAllLocalEvents);
        });
      } catch (error) {
        console.log("delete local events tabale error :: ", error);
      }

      try {
        await database.write(async () => {
          let localUsers = await database.collections.get("users").query().fetch();
          const deleteAllLocalUsers = localUsers.map((comment) =>
            comment.prepareDestroyPermanently()
          );
          database.batch(deleteAllLocalUsers);
        });
      } catch (error) {
        console.log("delete local users tabale error :: ", error);
      }

      try {
        await database.write(async () => {
          let discountsResponse = await database.collections.get("discounts").query().fetch();
          const deletedDiscount = discountsResponse.map((comment) =>
            comment.prepareDestroyPermanently()
          );
          database.batch(deletedDiscount);
        });
      } catch (error) {
        console.log("delet disount tabale error :: ", error);
      }

      try {
        await database.write(async () => {
          let localLocations = await database.collections.get("locations").query().fetch();
          const deleteAllLocalLocations = localLocations.map((comment) =>
            comment.prepareDestroyPermanently()
          );
          database.batch(deleteAllLocalLocations);
        });
      } catch (error) {
        console.log("delete local locations tabale error :: ", error);
      }

      try {
        await database.write(async () => {
          let localMenus = await database.collections.get("menus").query().fetch();
          const deleteAllLocalMenus = localMenus.map((comment) =>
            comment.prepareDestroyPermanently()
          );
          database.batch(deleteAllLocalMenus);
        });
      } catch (error) {
        console.log("delete local menus tabale error :: ", error);
      }

      try {
        await database.write(async () => {
          let localMenuItems = await database.collections.get("menuItems").query().fetch();
          const deleteAllLocalMenuItems = localMenuItems.map((comment) =>
            comment.prepareDestroyPermanently()
          );
          database.batch(deleteAllLocalMenuItems);
        });
      } catch (error) {
        console.log("delete local menuItems tabale error :: ", error);
      }

      try {
        await database.write(async () => {
          let localAttendees = await database.collections.get("attendees").query().fetch();
          const deleteAllLocalAttendees = localAttendees.map((attendee) =>
            attendee.prepareDestroyPermanently()
          );
          database.batch(deleteAllLocalAttendees);
        });
      } catch (error) {
        console.log("delete local attendees tabale error :: ", error);
      }

      try {
        await database.write(async () => {
          let localRFIDAssets = await database.collections.get("rfid_assets").query().fetch();
          const deleteAllLocalRFIDAssets = localRFIDAssets.map((rfidAsset) =>
            rfidAsset.prepareDestroyPermanently()
          );
          database.batch(deleteAllLocalRFIDAssets);
        });
      } catch (error) {
        console.log("delete local rfid_assets tabale error :: ", error);
      }

    } catch (e) { }
  };

  const loginOrganizer = async ({ username, password }) => {
    try {
      const {
        data: {
          login: { accessToken },
        },
      } = await login({
        variables: {
          username,
          password,
        },
      });
      if (accessToken) {
        const organizerUserResponse = await updateOrganizerUser({ accessToken });
        // Check if updateOrganizerUser returned an error response
        if (organizerUserResponse && organizerUserResponse.statusCode !== 200) {
          return organizerUserResponse;
        }
        await setCachedItem(KEY_NAME.ORG_USER_ACCESS_TOKEN, accessToken);
        await syncUsersEventsAndDiscount(true, true, true); // Users, Events, Discounts Sync
        return { statusCode: 200 };
      }
      return {
        statusCode: 401,
        errorMessage: `Invalid "Password" or "Username".`,
      };
    } catch (error) {

      if (error.networkError && !error.response) {
        return {
          statusCode: 503,
          errorMessage: "Could Not Authenticate\nCheck Your Internet Connectivity",
        };
      }
      return {
        statusCode: 401,
        errorMessage: `Invalid "Password" or "Username".`,
      };
    }
  };

  const updateOrganizerUser = async ({ accessToken, eventId = null }) => {
    if (accessToken) {
      try {
        const orgUser = extractUserFromAccessToken(accessToken);
        if (Date.now() <= orgUser.accessTokenExp * 1000 && orgUser.allowed_roles.includes("tablet_organizer")) {
          // syncing({ accessToken, orgUser, eventId });
          setOrganizerUser(orgUser);
          if (eventId) {
            verifyEmployeeUserJWT({ orgUser });
          } else {
            clearEmployeeUser();
          }
          return { statusCode: 200 }; // Ensure a successful response is returned
        } else {
          return {
            statusCode: 403,
            errorMessage: "Tablet Organizer Role Required",
          };
        }
      } catch (error) {
        clearOrganizerUser();
        return {
          statusCode: 500,
          errorMessage: error.message || "An error occurred",
        };
      }
    } else {
      clearOrganizerUser();
      return {
        statusCode: 401,
        errorMessage: "Access Token is required",
      };
    }
  };

  const verifyOrgUserJWT = async () => {
    try {
      const { item: accessToken } = await getCachedItem(
        KEY_NAME.ORG_USER_ACCESS_TOKEN
      );
      const { item: organizerEventId } = await getCachedItem(KEY_NAME.EVENT_ID);
      updateOrganizerUser({ accessToken, eventId: organizerEventId });
      updateCachedEvent(organizerEventId);
    } catch (error) {
      clearOrganizerUser();
    }
  };

  const updateCachedEvent = async (eventId) => {
    if (eventId) {
      const event = await database.collections.get("events").find(eventId);
      if (event) {
        setTabletSelections((prevState) => ({ ...prevState, event: event }));
      }
    }
  };

  const newUsersSync = async () => {
    const { item: accessToken } = await getCachedItem(
      KEY_NAME.ORG_USER_ACCESS_TOKEN
    );
    if (accessToken) {
      const orgUser = extractUserFromAccessToken(accessToken);
      await setCachedItem(KEY_NAME.ORG_ID, orgUser.organization_id);
      setOrgIdState(orgUser.organization_id);
      const newSyncUsers = new NewSyncService({
        database,
        organizationId: orgUser.organization_id,
        eventId: 0
      });
      newSyncUsers.newUsersSync();
    }
  };

  const syncUsersEventsAndDiscount = async (isUserSync, isEventSync, isDiscountSync) => {
    const { item: accessToken } = await getCachedItem(
      KEY_NAME.ORG_USER_ACCESS_TOKEN
    );
    if (accessToken) {
      const orgUser = extractUserFromAccessToken(accessToken);
      await setCachedItem(KEY_NAME.ORG_ID, orgUser.organization_id);
      setOrgIdState(orgUser.organization_id);
      const newSyncUserEventDiscount = new NewSyncService({
        database,
        organizationId: orgUser.organization_id,
        eventId: 0
      });
      newSyncUserEventDiscount.newUserEventDiscountSync(isUserSync, isEventSync, isDiscountSync); // Users, Events, Discounts Sync
    }
  };

  const syncLocationsMenusMenuItems = async (eventId, isAttendeesRFIDSync, isDiscountSync) => {
    const { item: accessToken } = await getCachedItem(
      KEY_NAME.ORG_USER_ACCESS_TOKEN
    );
    if (eventId) {
      const orgUser = extractUserFromAccessToken(accessToken);
      await setCachedItem(KEY_NAME.ORG_ID, orgUser.organization_id);
      setOrgIdState(orgUser.organization_id);
      const newSyncLocationsMenusItems = new NewSyncService({
        database,
        organizationId: orgUser.organization_id,
        eventId: eventId
      });
      newSyncLocationsMenusItems.newLocationsMenuMenuItemsSync(isAttendeesRFIDSync, isDiscountSync);
    }
  };

  const recursiveRfidAttendeeSync = async () => {
    attendeeRfidSyncTimeoutIds.forEach(id => clearTimeout(id));
    if (attendeeRfidSyncTimeoutIds.length > 5) {
      attendeeRfidSyncTimeoutIds = attendeeRfidSyncTimeoutIds.slice(-5);
    }
    try {
      const rfidSyncedPromise = getCachedItem(KEY_NAME.RFID_SYNC);
      const attendeesSyncedPromise = getCachedItem(KEY_NAME.ATTENDEES_SYNC);
      const rfidSynced = await rfidSyncedPromise;
      const attendeesSynced = await attendeesSyncedPromise;
      if (attendeesSynced.item === 'true' && rfidSynced.item === 'true') {
        const newSyncAttendeesRecursive = new NewSyncService({
          database,
          organizationId: orgIdState,
          eventId: eventIdState
        });
        await Promise.all([
          newSyncAttendeesRecursive.newAttendeesSyncRecursive(),
          newSyncAttendeesRecursive.newRFIDSyncRecursive(),
          newSyncAttendeesRecursive.newSyncAssociations(),
        ]);
        attendeeRfidSyncTimeoutIds.push(setTimeout(recursiveRfidAttendeeSync, 60000));
      } else {
        attendeeRfidSyncTimeoutIds.push(setTimeout(recursiveRfidAttendeeSync, 60000));
      }
    } catch (error) {
      console.error("Error in recursiveAttendeeRfidSync:", error);
    }
  };

  const recursiveOrderSync = async () => {
    orderSyncTimeoutIds.forEach(id => clearTimeout(id));
    if (orderSyncTimeoutIds.length > 5) {
      orderSyncTimeoutIds = orderSyncTimeoutIds.slice(-5);
    }
    try {
      if (!offlineMode) {
        const newSyncOrders = new NewSyncService({
          database,
          organizationId: 0,
          eventId: 0
        });
        await Promise.all([
          newSyncOrders.newOrderSync(),
          ACModule.processOfflineTransactions()
        ]);
        setSyncService(newSyncOrders)
      }
      orderSyncTimeoutIds.push(setTimeout(recursiveOrderSync, 60000));
    } catch (error) {
      console.error("Error in recursiveOrderSync:", error);
    }
  };

  const updateSelectedMenu = (data) => {
    let selectedMenu = tabletSelections.menu;
    if (tabletSelections.menu !== null) {
      if (data !== undefined && data.length !== 0) {
        data.map((mapItem) => {
          if (
            JSON.parse(tabletSelections.menu?._raw?.id) ===
            JSON.parse(mapItem?.id)
          ) {
            selectedMenu._raw.category = JSON.stringify(mapItem.category);
            updateTabletSelections({ menu: selectedMenu });
          }
        });
      }
    }
  };

  const showLoading = (loadingValue) => {
    setLoadingAuth(loadingValue);
  };

  const getDeviceId = async () => {
    try {
      const deviceId = await ACModule.getDeviceId();
      setDeviceId(deviceId);
    } catch (error) { }
  };

  const getMacAddress = async () => {
    try {
      const macAddress = await ACModule.getMacAddress();
      setMacAddress(macAddress);
    } catch (error) { }
  };

  const getFirmwarePromise = async () => {
    try {
      const firmwareVersions = await RoninChipModule.getFirmwarePromise();
      setFirmwareVersion(firmwareVersions);
    } catch (error) { }
  };

  useEffect(() => {
    verifyOrgUserJWT();
    getDeviceId();
    getMacAddress();
    getFirmwarePromise();
  }, []);

  useEffect(() => {
    const fetchCachedItems = async () => {
      const OrganizerId = await getCachedItem(KEY_NAME.ORG_ID);
      const EventId = await getCachedItem(KEY_NAME.EVENT_ID);
      setOrgIdState(prevOrgIdState => {
        if (prevOrgIdState === null && OrganizerId.item !== null) {
          return OrganizerId.item;
        }
        return prevOrgIdState;
      });
      setEventIdState(prevEventIdState => {
        if (prevEventIdState === null && EventId.item !== null) {
          return EventId.item;
        }
        return prevEventIdState;
      });
    };
    fetchCachedItems();
  }, []);

  useEffect(() => {
    if (eventIdState !== null && orgIdState !== null) {
      setAllowRecursive(true);
    }
  }, [eventIdState, orgIdState]);

  useEffect(() => {
    recursiveRfidAttendeeSync();
    return () => {
      attendeeRfidSyncTimeoutIds.forEach(id => clearTimeout(id));
    };
  }, [allowRecursive]);

  useEffect(() => {
    recursiveOrderSync();
    return () => {
      orderSyncTimeoutIds.forEach(id => clearTimeout(id));
    };
  }, [offlineMode]);

  async function signOutEmployee() {
    await clearEmployeeUser();
  }

  const onEventUpdate = async (selection) => {
    if (
      selection?.event?.id &&
      selection?.event?.id !== tabletSelections?.event?.id
    ) {
      await clearEmployeeUser();
    }
  };

  const updateTabletSelections = (selection) => {
    setTabletSelections((prevState) => ({ ...prevState, ...selection }));
    if (selection.hasOwnProperty("event")) {
      onEventUpdate(selection);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        organizerUser,
        setOrganizerUser,
        loginOrganizer,
        loginEmployee,
        setEventIdState,
        eventIdState,
        setAllowRecursive,
        menuDisplayRefresh,
        setMenuDisplayRefresh,
        syncUsersEventsAndDiscount,
        syncLocationsMenusMenuItems,
        employeeUser,
        setEmployeeUser,
        clearOrganizerUser,
        tabletSelections,
        updateTabletSelections,
        deviceId,
        macAddress,
        firmwareVersion,
        orgConfig,
        syncService,
        signOutEmployee,
        offlineMode,
        setOfflineMode,
        allowBatchMode,
        setAllowBatchMode,
        processingMode,
        setProcessingMode,
        syncLogs,
        netInfo,
        loadingAuth,
        showLoading,
        refreshMenu,
        setPaymentTypeState,
        paymentTypeState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => React.useContext(AuthContext);
