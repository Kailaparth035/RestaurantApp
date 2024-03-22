step 1. roninpos-core % vercel login  
roninpos-core % yarn vercel dev

matthewmarks@Matthews-MacBook-Pro-2 hasura-server % hasura migrate apply
matthewmarks@Matthews-MacBook-Pro-2 hasura-server % hasura metadata reload
matthewmarks@Matthews-MacBook-Pro-2 hasura-server % hasura metadata apply  
matthewmarks@Matthews-MacBook-Pro-2 hasura-server % hasura seeds apply

- docker-compose up --build
- vercel dev
- hasura console

docker-compose down -v

hasura migrate apply $$

eas build -p android --profile preview

token
patron_credit
promotion_credit

tokens = 4 a day
token = {
1: beer || nonalcoholic,
2: wine,
}

menu_item
price
token_price
promotion_price

~/Library/Android/sdk/emulator/emulator @Pixel_C_API_30

REACT_APP_HASURA_GRAPHQL_ENDPOINT=https://ronin-staging-pos.hasura.app/v1/graphql
REACT_APP_HASURA_GRAPHQL_SECRET=t7i15VzJJ2PHoCMR20vQCEJi1SE0gnG0KQZzXZOgc8uPw7V2QmUAR4xYzFdWW78q
BUGSNAG_KEY=693ead51e74a4a970271934335204ee8
REACT_APP_DESIGN_SYSTEM=false
DD_CLIENT_TOKEN=pub5b9a103dffcbf0312ea61d853b43f86e
DD_APPLICATION_ID=46b5df6d-d93f-4af1-ac2a-f67fe65f3ced
DD_ENVIRONMENT=uat
LOAD_STORYBOOK=false
RONIN_ENVIRONMENT=uat
RONIN_CLIENT=PS
REACT_APP_SYNC_DEBUG_FLAG=false
REACT_APP_SYNC_RATE_SECONDS=60
REACT_APP_APPOLLO_CLIENT_TIMOUT=15
Name=Value

https://ronin-uat-pos.hasura.app/v1/graphql

docker-compose -f docker-compose-m1.yml up --build

# query {

# # financial_report_query(

# # financialReportInput:{

# # organization_id: 34,

# # datetime_start: "2022-04-05T00:00:00Z",

# # datetime_end: "2022-04-09T23:59:00Z",

# # event_id: 48

# # }

# financial_report(

# where: {

# \_and: {

# organization_id: {

# \_eq: 34

# },

# event_id: {

# \_eq: 48

# },

# location_id: {

# \_eq: 129

# },

# vendor_id: {},

# transaction_date: {

# \_gte: "2022-04-05T00:00:00Z",

# \_lte: "2022-04-09T23:59:00Z"

# }

# }

# }

# ) {

# location_name

# transaction_hour

# cash_gross_sales

# cash_payment_count

# credit_gross_sales

# credit_payment_count

# rfid_gross_sales

# rfid_payment_count

# total_credit_tip

# total_digital_surcharges

# total_digital_tip

# total_gross_sales

# total_payment_count

# total_refunds

# total_rfid_tip

# total_taxes

# transaction_date

# transaction_15min

# }

# }

query {
orders( where:{created_at: {
\_gte: "2022-04-01T18:00:00+00:00",
\_lte: "2022-04-09T19:00:00+00:00"
}, event:{
timezone: {
\_eq:"CDT"
}
} }, order_by: {transaction_at: desc}) {
transaction_at
created_at
transaction_time
subtotal
event {
timezone
name
}
}
financial_report(
where: {
\_and: {
organization_id: {
\_eq: 34
},
event_id: {
\_eq: 48
},
location_id: {
\_eq: 129
},
vendor_id: {},
transaction_date: {
\_gte: "2022-04-05T00:00:00Z",
\_lte: "2022-04-09T23:59:00Z"
}

            }
        }

    ) {
      location_name
      transaction_hour
      # cash_gross_sales
      # cash_payment_count
      # credit_gross_sales
      # credit_payment_count
      # rfid_gross_sales
      # rfid_payment_count
      # total_credit_tip
      # total_digital_surcharges
      # total_digital_tip
      total_gross_sales
      total_payment_count
      # total_refunds
      # total_rfid_tip
      # total_taxes
      transaction_date
      transaction_15min

    }

}

# query {

# users(where:{role_id:{\_eq: 1}}) {

# id

# username

# }

# }
