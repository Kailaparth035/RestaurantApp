import SInfo from "react-native-sensitive-info";
import { KEYCHAIN_SERVICE, SHAREDPREFS_NAME } from "./constants";
export const deleteCachedItem = async (name) => {
  try {
    return await SInfo.deleteItem(name, {
      sharedPreferencesName: SHAREDPREFS_NAME,
      keychainService: KEYCHAIN_SERVICE,
    });
  } catch (error) {}
};

export const setCachedItem = async (name, value) => {
  try {
    await SInfo.setItem(name, value, {
      sharedPreferencesName: SHAREDPREFS_NAME,
      keychainService: KEYCHAIN_SERVICE,
    });
  } catch (error) {}
};

export const getCachedItem = async (name) => {
  try {
    const item = await SInfo.getItem(name, {
      sharedPreferencesName: SHAREDPREFS_NAME,
      keychainService: KEYCHAIN_SERVICE,
    });
    return { item };
  } catch (error) {
    return { error };
  }
};
