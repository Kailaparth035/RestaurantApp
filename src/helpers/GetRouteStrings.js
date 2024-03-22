/* eslint-disable default-case */
/* eslint-disable no-unused-expressions */
// eslint-disable-next-line import/prefer-default-export
export const GetBackTitle = (route) => {
  const routeName = route ? route.name : "No route";

  switch (routeName) {
    case "UserLogin":
      return "Sign Out To Organizer";
    case "OrganizerConfig":
      return "Sign Out To Organizer";
    case "PosConfig":
      return "Sign Out Clerk";
    case "EditOrder":
      return "Menu";
    case "Menu":
      return "Menu Selection";
    case "OrderHistory":
      return "Menu";
    case "AdminPanel":
      return "Menu Selection";
    case "TenderedAmountStepCash":
      return "Menu";
    case "ApprovedStepCash":
      return "Menu";
    case "EnterPhoneNumberStepCash":
      return "Menu";
    case "TransactionCompletedStepCash":
      return "Menu";
    case "TipStepCredit":
      return "Menu";
    case "CreditStart":
      return "Menu";
    case "EnterPhoneNumberStepCredit":
      return "Menu";
    case "TransactionCompletedStepCredit":
      return "Menu";
    case "No route":
      return "Back";
    default:
      return "Back";
  }
};

export const GetReturnRoute = (route) => {
  const routeName = route ? route.name : "No route";
  switch (routeName) {
    case "UserLogin":
      return "CompanyLogin";
    case "PosConfig":
      return "UserLogin";
    case "OrganizerConfig":
      return "CompanyLogin";
    case "EditOrder":
      return "Menu";
    case "Menu":
      return "PosConfig";
    case "OrderHistory":
      return "Menu";
    case "AdminPanel":
      return "PosConfig";
    case "No route":
      return "Back";
    default:
      return "Back";
  }
};

export const GetConfirmationMessage = (
  route,
  actionType,
  orderTotal,
  customTip
) => {
  const routeName = route ? route.name : "No route";
  switch (routeName) {
    case "UserLogin":
      if (actionType === "reLaunchApp") {
        return "Log out of Clerk and Organizer, or Relaunch?";
      } else {
        return "Are you sure you want \nto sign out of this organization?";
      }
    case "OrganizerConfig":
      if (actionType === "reLaunchApp") {
        return "Log out of Clerk and Organizer, or Relaunch?";
      } else {
        return "Are you sure you want \nto sign out of this organization?";
      }
    case "AdminLogin":
      return "Are you sure you want \nto sign out?";
    case "AdminPanel":
      if (actionType === "voidAction") {
        return (
          "Voiding this order will refund the full amount of $" +
          orderTotal +
          " to the customer."
        );
      } else {
        return "Are you sure you want \nto sign out?";
      }
    case "PosConfig":
      if (actionType === "reLaunchApp") {
        return "Log out of Clerk and Organizer, or Relaunch?";
      } else {
        return "Are you sure you want \nto sign out?";
      }
    case "EditOrder":
      return "Are you sure you don’t want \nto save the changes?";
    case "OrderHistory":
      if (actionType === "voidAction") {
        return (
          "Voiding this order will refund the full amount of $" +
          orderTotal +
          " to the customer."
        );
      } else {
        return "Are you sure you want to go back,\n to POS Config, proceed?";
      }
    case "Menu":
      if (actionType === "reLaunchApp") {
        return "Log out of Clerk and Organizer, or Relaunch?";
      } else if (actionType === "referesh") {
        return "Are you sure you want to Refresh Menu / Items?";
      } else {
        return "Order will be lost if you continue to \nMenu Selection, proceed?";
      }
    case "TenderedAmountStepCash":
    case "ApprovedStepCash":
    case "EnterPhoneNumberStepCash":
    case "TransactionCompletedStepCash":
      return "Are you sure you want \nto sign out?";
    case "TipStepRfid":
    case "TipStepQRCode":
    case "TipStepCredit":
      return "Are you sure you want to tip " + customTip + "?";
    case "No route":
      return "No route configuration made. Pressing Submit will lead to error";
    default:
      return "Are you sure you want to go back?";
  }
};

export const GetButtonText = (route, actionType) => {
  const routeName = route ? route.name : "No route";

  switch (routeName) {
    case "UserLogin":
      if (actionType === "reLaunchApp") {
        return "CONFIRM";
      } else {
        return "SIGN OUT";
      }
    case "OrganizerConfig":
      if (actionType === "reLaunchApp") {
        return "CONFIRM";
      } else {
        return "SIGN OUT";
      }
    case "AdminPanel":
      if (actionType === "voidAction") {
        return "Void";
      } else {
        return "SIGN OUT";
      }
    case "Menu":
      if (actionType === "reLaunchApp") {
        return "CONFIRM";
      } else {
        return "YES";
      }

    case "EditOrder":
      return "CONFIRM";
    case "PosConfig":
      if (actionType === "reLaunchApp") {
        return "CONFIRM";
      } else {
        return "SIGN OUT";
      }

    case "TenderedAmountStepCash":
    case "ApprovedStepCash":
    case "EnterPhoneNumberStepCash":
    case "TransactionCompletedStepCash":
      return "SIGN OUT";
    case "TipStepRfid":
    case "TipStepQRCode":
    case "TipStepCredit":
      return "YES";
    case "OrderHistory":
      if (actionType === "voidAction") {
        return "Void";
      } else {
        return "SUBMIT";
      }
    default:
      return "SUBMIT";
  }
};

export const GetButtonStatus = (route) => {
  const routeName = route ? route.name : "No route";

  switch (routeName) {
    case "PosConfig":
      return "primary";
    case "UserLogin":
      return "quaternary";
    default:
      return "primary";
  }
};
