import { gql } from "@apollo/client";

//role_id = 3 for clerk
export const getClerkUsers = gql`
query getClerkUsers($organizationId: Int!){
  users(where: {organization_id: {_eq: $organizationId}, role_id: {_eq: 3}}) {
    id
    role_id
    username
    password_hash
    tablet_access_code
    phone_number
    validation_time
    email
    organization_id
    event_id
  }
}
`;

export const PUSH_ORDER_CARD = gql`
  mutation AddOrder($orderServiceInputCard: OrderServiceInputCard!) {
    order_service_card(orderServiceInputCard: $orderServiceInputCard) {
      message
    }
  }
`;

export const PUSH_ORDER_RFID = gql`
  mutation AddOrder($orderServiceInputRfid: OrderServiceInputRfid!) {
    order_service_rfid(orderServiceInputRfid: $orderServiceInputRfid) {
      message
    }
  }
`;

export const PUSH_ORDER_QRCODE = gql`
  mutation AddOrder($orderServiceInputRfid: OrderServiceInputRfid!) {
    order_service_rfid(orderServiceInputRfid: $orderServiceInputRfid) {
      message
    }
  }
`;

export const PUSH_ORDER_CASH = gql`
  mutation AddOrder($orderServiceInputCash: OrderServiceInputCash!) {
    order_service_cash(orderServiceInputCash: $orderServiceInputCash) {
      message
    }
  }
`;
export const LOOKUP_RFID = gql`
  query CheckIfUidExists($uid: String!, $eventId: Int!) {
    rfid_assets_by_pk(uid: $uid, event_id: $eventId) {
      uid
      id
      event_id
      attendee_id
      tokens_balance
      cash_balance
      promo_balance
      is_active
      last_four_phone_numbers
      attendee {
        id
        is_active
        is_register
      }
    }
  }
`;

export const RFID_LOOKUP = gql`
  mutation LookupRfid($eventId: Int!, $uid: String!) {
    lookup_rfid_uid(lookupInput: { eventId: $eventId, uid: $uid }) {
      is_active
      last_four_phone_numbers
      message
      tokens_balance
      attendee_id
    }
  }
`;

export const GET_RFID_STATUS = gql`
  query GET_RFID_STATUS($uid: String!) {
    rfid_assets(where: { uid: { _eq: $uid } }) {
      is_active
      uid
      last_four_phone_numbers
      tokens_balance
      cash_balance
      promo_balance
    }
  }
`;

export const GET_SINGLE_RFID_FOR_SYNC = gql`
  query GET_SINGLE_RFID_FOR_SYNC($uid: String!, $eventId: Int!) {
    rfid_assets(where: { event_id: { _eq: $eventId }, uid: { _eq: $uid } }) {
      id
      event_id
      is_active
      last_four_phone_numbers
      uid
      tokens_balance
      cash_balance
      promo_balance
    }
  }
`;

export const GET_EVENT_RFIDS = gql`
  query GET_EVENT_RFIDS($lastSyncTime: timestamptz!, $eventId: Int!) {
    rfid_assets(
      where: { event_id: { _eq: $eventId }, updated_at: { _gt: $lastSyncTime } }
    ) {
      id
      event_id
      is_active
      last_four_phone_numbers
      uid
      tokens_balance
      cash_balance
      promo_balance
    }
  }
`;

export const GET_EVENT_RFIDS_LIMIT = gql`
  query GET_EVENT_RFIDS_LIMIT(
    $lastSyncTime: timestamptz!
    $eventId: Int!
    $offset: Int!
    $limit: Int!
  ) {
    rfid_assets(
      where: { event_id: { _eq: $eventId }, updated_at: { _gt: $lastSyncTime } }
      offset: $offset
      limit: $limit
    ) {
      id
      event_id
      attendee_id
      is_active
      last_four_phone_numbers
      uid
      tokens_balance
      cash_balance
      promo_balance
    }
  }
`;

export const GET_EVENT_RFIDS_AGG = gql`
  query GET_EVENT_RFIDS_AGG($eventId: Int!) {
    rfid_assets_aggregate(where: { event_id: { _eq: $eventId } }) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_EVENT_RFIDS_MAX_UPDATED_AT = gql`
  query GET_EVENT_RFIDS_AGG($eventId: Int!) {
    rfid_assets_aggregate(where: { event_id: { _eq: $eventId } }) {
      aggregate {
        max {
            updated_at
        }
      }
    }
  }
`;

export const GET_EVENT_ATTENDEES = gql`
  query GET_EVENT_ATTENDEES($lastSyncTime: timestamptz!, $eventId: Int!) {
    attendees(
      where: { event_id: { _eq: $eventId }, updated_at: { _gt: $lastSyncTime } }
      order_by: { updated_at: desc }
    ) {
      card_on_files(
        order_by: { updated_at: desc }
        where: { is_active: { _eq: true } }
      ) {
        card_type
        payment_data
      }
      id
      event_id
      is_active
      phone_number
      personnal_pin
      promo_balance
      promo_balance_rfid_applied
      updated_at
    }
  }
`;

export const GET_EVENT_ATTENDEES_LIMIT = gql`
  query GET_EVENT_ATTENDEES_LIMIT(
    $lastSyncTime: timestamptz!
    $eventId: Int!
    $offset: Int!
    $limit: Int!
  ) {
    attendees(
      where: { event_id: { _eq: $eventId }, updated_at: { _gt: $lastSyncTime } }
      offset: $offset
      limit: $limit
      order_by: { updated_at: desc }
    ) {
      card_on_files(
        order_by: { updated_at: desc }
        where: { is_active: { _eq: true } }
      ) {
        card_type
        payment_data
      }
      id
      event_id
      is_active
      phone_number
      personnal_pin
      promo_balance
      promo_balance_rfid_applied
      updated_at
    }
  }
`;

export const GET_EVENT_ATTENDEES_AGG = gql`
  query GET_EVENT_ATTENDEES_AGG($eventId: Int!) {
    attendees_aggregate(where: { event_id: { _eq: $eventId } }) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_EVENT_ATTENDEES_MAX_UPDATED_AT = gql`
  query GET_EVENT_ATTENDEES_AGG($eventId: Int!) {
    attendees_aggregate(where: { event_id: { _eq: $eventId } }) {
      aggregate {
        max {
            updated_at
        }
      }
    }
  }
`;

export const SEND_RFID_ASSOCIATION_LINK = gql`
  mutation AssociateRfid($AssociationInput: AssociationInput!) {
    associate_rfid(attendeeInput: $AssociationInput) {
      message
    }
  }
`;

export const getEventsQuery = gql`
  query events($organizationId: Int!) {
    events(
      where: {
        is_active: { _eq: true }
        organization_id: { _eq: $organizationId }
      }
    ) {
      created_at
      currency
      end_date
      id
      configuration
      name
      updated_at
      timezone
      start_date
      payment_types
      available_tokens
      organization_id
      digital_surcharge_label
      dynamic_descriptor
      is_org_logout_protected
      is_clerk_logout_protected
      event_passcode
    }
  }
`;

export const getDiscountsQuery = gql`
  query getDiscounts($organizationId: Int!) {
    discount(where: { organization_id: { _in: [$organizationId, 0] } }) {
      amount
      code
      description
      created_at
      discount_type
      id
      name
      percentage
      updated_at
    }
  }
`;

export const getMenusQuery = gql`
  query menus($eventId: Int!) {
    menus(
      where: {
        location_menus: { menu: { event_id: { _eq: $eventId } } }
        is_active: { _eq: true }
      }
    ) {
      event_id
      is_active
      id
      name
      updated_at
      created_at
      tax_type
      is_cash
      is_credit
      is_rfid
      is_qr
      is_tips
      is_cash_not_taxed
      processing_mode
      tip_percentage_1
      is_discount
      is_discount_protected
      tip_percentage_2
      tip_percentage_3
      category
      is_custom_item
      location_menus {
        location_id
      }
    }
  }
`;

export const getLocationsQueryWithoutSync = gql`
  query locations($eventId: Int!) {
    locations(
      where: { is_active: { _eq: true }, event_id: { _eq: $eventId } }
    ) {
      updated_at
      created_at
      event_id
      id
      is_active
      name
      digital_surcharge_percentage
      vendor_id
      dynamic_descriptor
      redeemable_tokens
      location_menus(where: { menu: { is_active: { _eq: true } } }) {
        menu_id
        menu {
          id
          name
        }
      }
      payment_processor_config {
        config
        payment_processor
      }
    }
  }
`;

export const addCashBalance = gql`
  mutation AddCash(
    $uid: String!
    $eventId: Int!
    $locationId: Int!
    $cashBalance: Int!
    $updatedBy: Int
    $addedCash: Int!
  ) {
    update_rfid_assets(
      where: { uid: { _eq: $uid }, event_id: { _eq: $eventId } }
      _set: { cash_balance: $cashBalance }
    ) {
      returning {
        cash_balance
      }
    }
    insert_cash_balance_history_one(
      object: {
        uid: $uid
        event_id: $eventId
        cash_balance: $cashBalance
        updated_by: $updatedBy
        added_cash: $addedCash
        location_id: $locationId
      }
    ) {
      uid
      event_id
      cash_balance
      updated_by
      added_cash
    }
  }
`;

export const addRfidAssetWithCashBalance = gql`
  mutation insertRfidAssetMutation(
    $uid: String!
    $eventId: Int!
    $locationId: Int!
    $cashBalance: Int!
    $updatedBy: Int!
    $addedCash: Int!
  ) {
    insert_rfid_assets_one(
      object: {
        event_id: $eventId
        is_active: false
        uid: $uid
        cash_balance: $cashBalance
      }
    ) {
      is_active
      id
      cash_balance
      uid
    }
    insert_cash_balance_history_one(
      object: {
        uid: $uid
        event_id: $eventId
        cash_balance: $cashBalance
        updated_by: $updatedBy
        added_cash: $addedCash
        location_id: $locationId
      }
    ) {
      uid
      event_id
      cash_balance
      updated_by
      added_cash
    }
  }
`;

export const addPromoBalance = gql`
  mutation AddPromo(
    $uid: String!
    $eventId: Int!
    $locationId: Int!
    $promoBalance: Int!
    $updatedBy: Int
    $addedPromo: Int!
  ) {
    update_rfid_assets(
      where: { uid: { _eq: $uid }, event_id: { _eq: $eventId } }
      _set: { promo_balance: $promoBalance }
    ) {
      returning {
        promo_balance
      }
    }
    insert_promo_balance_history_one(
      object: {
        uid: $uid
        event_id: $eventId
        location_id: $locationId
        promo_balance: $promoBalance
        updated_by: $updatedBy
        added_promo: $addedPromo
      }
    ) {
      uid
      event_id
      promo_balance
      updated_by
      added_promo
    }
  }
`;

export const addRfidAssetWithPromoBalance = gql`
  mutation insertRfidAssetMutation(
    $uid: String!
    $eventId: Int!
    $locationId: Int!
    $promoBalance: Int!
    $updatedBy: Int!
    $addedPromo: Int!
  ) {
    insert_rfid_assets_one(
      object: {
        event_id: $eventId
        is_active: false
        uid: $uid
        promo_balance: $promoBalance
      }
    ) {
      is_active
      id
      promo_balance
      uid
    }
    insert_promo_balance_history_one(
      object: {
        uid: $uid
        event_id: $eventId
        promo_balance: $promoBalance
        updated_by: $updatedBy
        added_promo: $addedPromo
        location_id: $locationId
      }
    ) {
      uid
      event_id
      promo_balance
      updated_by
      added_promo
    }
  }
`;
export const logStuckOrders = gql`
  mutation logStuckOrders($input: String) {
    log_stuck_orders(input: $input) {
      message
    }
  }
`;

export const getMenuItems = gql`
  query items($eventId: Int!) {
    items(where: { event_id: { _eq: $eventId }, is_active: { _eq: true } }) {
      id
      image
      name
      price
      short_name
      unique_id
      description
      redeemable_token_id
      redeemable_token_name
      token_price
      tax_percentage
      tax
      is_active
      created_at
      description
      updated_at
      upc
      modifiers
      modifier_type
      is_variable_price
    }
  }
`;

export const getOrderId = gql`
  query orders($reference_id: String) {
    orders(where: { reference_id: { _eq: $reference_id } }) {
      id
    }
  }
`;

export const REFUND_ORDER = gql`
  mutation RefundItem($object: RefundsInsertInput) {
    insert_refunds_one(object: $object) {
      statusMessage
    }
  }
`;

export const CREATE_ITEM = gql`
  mutation create_item($input: items_insert_input!) {
    insert_items_one(object: $input) {
      id
    }
  }
`;

export const UPDATE_MENU_CATEGORY = gql`
  mutation update_menus($input: menus_set_input, $id: Int!) {
    update_menus_by_pk(_set: $input, pk_columns: { id: $id }) {
      id
    }
  }
`;

export const GET_EVENT_TOKEN_DATA = gql`
  query events($event_id: Int!) {
    events(where: { id: { _eq: $event_id } }) {
      available_tokens
    }
  }
`;

export const UPDATE_TOKEN_BALANCE = gql`
  mutation rfid_assets(
    $input: rfid_assets_set_input
    $event_id: Int!
    $uid: String!
  ) {
    update_rfid_assets_by_pk(
      _set: $input
      pk_columns: { event_id: $event_id, uid: $uid }
    ) {
      id
    }
  }
`;

export const GET_ATTENDEES_WITH_EVENTID = gql`
  query attendees($event_id: Int!) {
    attendees(where: { event_id: { _eq: $event_id } }) {
      id
      first_name
    }
  }
`;

export const UPDATE_MENUITEM_UPC = gql`
  mutation items($id: Int!, $input: items_set_input) {
    update_items_by_pk(_set: $input, pk_columns: { id: $id }) {
      id
    }
  }
`;
