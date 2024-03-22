import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import {
  REACT_APP_APPOLLO_CLIENT_TIMOUT,
  REACT_APP_HASURA_GRAPHQL_ENDPOINT,
} from "@env";
import ApolloLinkTimeout from "apollo-link-timeout";
import SInfo from "react-native-sensitive-info";
import { KEYCHAIN_SERVICE, SHAREDPREFS_NAME } from "../helpers/constants";
import { WriteLog } from "../../src/CommonLogFile";

const httpLink = new HttpLink({
  uri: REACT_APP_HASURA_GRAPHQL_ENDPOINT,
});

const authLink = setContext(async (_, { headers }) => {
  try {
    const accessToken = await SInfo.getItem("orgUserAccessToken", {
      sharedPreferencesName: SHAREDPREFS_NAME,
      keychainService: KEYCHAIN_SERVICE,
    });

    if (accessToken) {
      return {
        headers: {
          ...headers,
          Authorization: `Bearer ${accessToken}`,
        },
      };
    }

    return {
      headers: {
        ...headers,
      },
    };
  } catch (e) {
    WriteLog("ApolloClient" + e);
    console.log(e);
    return e;
  }
});

const APPOLLO_CLIENT_TIMOUT =
  REACT_APP_APPOLLO_CLIENT_TIMOUT * 1000 || 15 * 1000;

const httpAuthLink = authLink.concat(httpLink);

const timeoutLink = new ApolloLinkTimeout(APPOLLO_CLIENT_TIMOUT);
const timeoutHttpLink = timeoutLink.concat(httpAuthLink);

export default new ApolloClient({
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: "network-only",
    },
  },
  link: timeoutHttpLink,
});
