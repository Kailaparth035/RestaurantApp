Sync Orders and Transactions

- Error: No vaulted cart attached to this RFID asset

  - Need to add boolean has_vaulted_card field to rfid_assets
  - Add a trigger that updates the rfid_asset when the the attendee vaulted card or related file updates)
  - orders that were rejected offline but still completed locally will still show
  - Present error to user on tablet

- Offline order that succeeds show 0 total (what's going on there)

- Add pendingSync that forces an organizer to act before changing location and menu
