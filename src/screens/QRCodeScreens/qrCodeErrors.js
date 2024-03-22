export const qrCodeErrors = {
  ["Invalid uid or event"]: {
    errorType: "unexpected",
    errorHeader: "Something went wrong",
    errorMessage: "We're sorry, your transaction is declined.",
  },
  ["Invalid uid or event or missing credential"]: {
    errorType: "unexpected",
    errorHeader: "Something went wrong",
    errorMessage: "We're sorry, your transaction is declined.",
  },
  ["Rfid was associated to a wrong event"]: {
    errorType: "unexpected",
    errorHeader: "Something went wrong",
    errorMessage: "We're sorry, your transaction is declined.",
  },
  ["Rfid is inactive"]: {
    errorType: "revokedRfid",
    errorHeader: "Wristband is invalid.",
    errorMessage: "Contact customer support.",
  },
  ["Rfid not associated to an attendee"]: {
    errorType: "unexpected",
    errorHeader: "Something went wrong",
    errorMessage: "We're sorry, your transaction is declined.",
  },
  ["Linked attendee hasn't completed the registration flow"]: {
    errorType: "invalidAttendee",
    errorHeader:
      "We're sorry, your transaction cannot be completed.",
    errorMessage:
      "Your attendee profile is incomplete or has not been created.",
  },
  ["Linked attendee is inactive"]: {
    errorType: "invalidAttendee",
    errorHeader:
      "We're sorry, your transaction cannot be completed.",
    errorMessage:
      "Your attendee profile is incomplete or has not been created.",
  },
  ["No active card on file"]: {
    errorType: "invalidAttendee",
    errorHeader:
      "We're sorry, your transaction cannot be completed.",
    errorMessage:
      "Your attendee profile is incomplete or has not been created.",
  },
  default: {
    errorType: "unexpected",
    errorHeader: "Something went wrong",
    errorMessage: "We're sorry, your transaction is declined.",
  },
  notDetected: {
    errorType: "undetected",
    errorHeader: "Wristband not detected.",
    errorMessage: "Try to scan the wristband again.",
  },
  noRFIDLocally: {
    errorType: "undetected",
    errorHeader: "Wristband not found locally",
    errorMessage: "Please try syncing remote database.",
  }
}