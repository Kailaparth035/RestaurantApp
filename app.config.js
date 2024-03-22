


// export default {
//   expo: {
//     // ...
//     extra: {
//       // Add your extra configs here
//       apiKey: process.env.API_KEY
//     }
//   }
// };

module.exports = () => {
  const appConfig = {
    "name": "posapp",
    "displayName": "posapp",
    "expo": {
      "name": "posapp",
      "slug": "posapp",
      "sdkVersion": "38.0.0",
        extra: {
          REACT_APP_HASURA_GRAPHQL_ENDPOINT: process.env.REACT_APP_HASURA_GRAPHQL_ENDPOINT || "http://localhost:8081/v1/graphql",
          REACT_APP_HASURA_GRAPHQL_SECRET: process.env.REACT_APP_HASURA_GRAPHQL_SECRET || 'mylittlesecret',
          BUGSNAG_KEY: process.env.BUGSNAG_KEY,
          DD_CLIENT_TOKEN: process.env.DD_CLIENT_TOKEN,
          DD_APPLICATION_ID: process.env.DD_APPLICATION_ID,
          DD_ENVIRONMENT: process.env.DD_ENVIRONMENT,
          RONIN_ENVIRONMENT: process.env.RONIN_ENVIRONMENT,
          REACT_APP_DESIGN_SYSTEM: false,
          LOAD_STORYBOOK: false,
          RONIN_CLIENT: "PS",
          REACT_APP_SYNC_DEBUG_FLAG: false,
          REACT_APP_SYNC_RATE_SECONDS: 60,
          REACT_APP_APPOLLO_CLIENT_TIMOUT: 15, 
        }
    }
  }

  return appConfig
};
