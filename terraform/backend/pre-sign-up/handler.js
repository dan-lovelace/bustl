exports.main = (event, context, callback) => {
  console.log("event", event);
  // Set the user pool autoConfirmUser flag after validating the email domain
  event.response.autoConfirmUser = true;
  console.log("response", event.response);
  // // Split the email address so we can compare domains
  // var address = event.request.userAttributes.email.split("@");

  // // This example uses a custom attribute "custom:domain"
  // if (event.request.userAttributes.hasOwnProperty("custom:domain")) {
  //   if (event.request.userAttributes["custom:domain"] === address[1]) {
  //     event.response.autoConfirmUser = true;
  //   }
  // }

  // Return to Amazon Cognito
  callback(null, event);
};
