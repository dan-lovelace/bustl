exports.handler = (event, context, callback) => {
  console.log("event", event);
  // event.response = {
  //   claimsOverrideDetails: {
  //     // "claimsToAddOrOverride": {
  //     //     "attribute_key2": "attribute_value2",
  //     //     "attribute_key": "attribute_value"
  //     // },
  //     // "claimsToSuppress": ["email"],
  //     groupOverrideDetails: {
  //       // groupsToOverride: ["system-user"],
  //       // "iamRolesToOverride": ["arn:aws:iam::XXXXXXXXXXXX:role/sns_callerA", "arn:aws:iam::XXXXXXXXX:role/sns_callerB", "arn:aws:iam::XXXXXXXXXX:role/sns_callerC"],
  //       // "preferredRole": "arn:aws:iam::XXXXXXXXXXX:role/sns_caller"
  //     },
  //   },
  // };

  // Return to Amazon Cognito
  callback(null, event);
};
