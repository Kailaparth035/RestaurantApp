# POSAPP

## Front End Application Used on Android Tablet

[badge status](https://build.appcenter.ms/v0.1/apps/c9c0b39b-0228-40bb-bb33-6d85ac6d57c6/branches/develop/badge)

## .env config

Create `.env` file in root:

```
REACT_APP_HASURA_GRAPHQL_ENDPOINT=http://localhost:8082/v1/graphql
REACT_APP_HASURA_GRAPHQL_SECRET=mylittlesecret
DD_CLIENT_TOKEN= ...
DD_ENVIRONMENT= ...
DD_APPLICATION_ID= ...
```

When changing values of your .env, be sure to clear the cache or else those changes may not be picked up:
```
rm -rf node_modules/.cache/babel-loader/\*
```
or:
```
yarn start --reset-cache
```

## Android Studio
SDK: Android 10.0

API Level: 29

### Android Virtual Device
Size: 8.0"

Resolution: 800x1280

Multi-Core: 4

RAM: 2GB

Internal Storage: 16GB

## Bugsnag

Dashboard: https://app.bugsnag.com/the-product-shop/roninpos-app/

## VS App Center

App center: https://appcenter.ms/orgs/The-Product-Shop/apps/roninpos-app/analytics/overview

## Datadog

RUM (Real User Monitoring):
https://app.datadoghq.com/rum/explorer?tab=session&from_ts=1632168872835&to_ts=1632172472835&live=true

Getting started with RUM:
https://www.datadoghq.com/blog/real-user-monitoring-with-datadog/

## Simulator reset

     * Reset metro bundler cache :
     `npx react-native start --reset-cache`

     * Remove Android assets cache :
     `cd android && ./gradlew clean`

     * Relaunch metro server :
     `npx react-native run-android

## Storybook

in your .env file,
`LOAD_STORYBOOK=true` will load up the storybook component library instead of
app

though not necessary, you can run the storybook server as well with yarn storybook

## Style Guides

https://github.com/airbnb/javascript
https://github.com/bradfrost/atomic-design
