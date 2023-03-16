/**
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecuteCredentialsExchange = async (event, api) => {
  console.log("b", event.request.body);
};
