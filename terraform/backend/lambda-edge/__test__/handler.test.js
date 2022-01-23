const { decode } = require("jsonwebtoken");
const { test } = require("@jest/globals");

const {
  main,
  checkPreflight,
  verifyAuth,
  verifyOrigin,
} = require("../handler");

// LOCAL TESTING ------------------------------------------------
// 1. replace with a valid appsync access token
const validJwt =
  "eyJraWQiOiJ3ZmFoMVh3dUlOK2d6VSsxdEtPdzZIdzErdE5qeWJ2dmFDOGFqaXpKWkJNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4YzBjOWExZi04YzUxLTRkNjUtODZiMS1iNWU4OGY3NWFmOWEiLCJjb2duaXRvOmdyb3VwcyI6WyJzeXN0ZW0tdXNlciJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl9oakNncUxHUWUiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiJ0azhyZXYxbGFzaDQ2dGltMG8zbmhyMnU2IiwiZXZlbnRfaWQiOiI5ZTk2ZmE0Zi1jN2E3LTQ2MzUtOWE1ZS1mNmQ0YWY4NjY3Y2UiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIG9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXV0aF90aW1lIjoxNjExMDA3Nzc5LCJleHAiOjE2MTEwMTkxMDIsImlhdCI6MTYxMTAxNTUwMiwianRpIjoiMWIyMzdhNTAtOWUwMS00MWJmLWIwOGUtMzg4NmFkOGQ4OGM0IiwidXNlcm5hbWUiOiI4YzBjOWExZi04YzUxLTRkNjUtODZiMS1iNWU4OGY3NWFmOWEifQ.X3I88f52imwA6FzQWGJoWxCMQvDaSoY3PXt0QjEuR8udQ4R768ED16xNTDTwNQ_UeDrwvHXy6jedzgTlMnxTOGi6XuPRwgrpJIS08kawKTMsq6ntHsU9V-OCyISqK3ipQjH9mRdMTx_qXZ4Cw2Qw7qrNH88zDkjBKuvUWANf-aaBUk2I14cwGBjT_Gvlbdhf46UcpQeKSlhbYhy9eeMwfjuMuJuDw1EuhL8j0lxK-uEraqn-iv0Rj4BkKGZdo44WgYYCWkqIel-FG-Ypr9VzLhYA1xBi2rs-DlBMG9_C2FIcGwg4VMBdwHydLCSqBGwNTdwU9-6F9olrK7BS18tqLg";
// 2. set to target environment's app domain
const testAppDomain = "dev.bus.tl";
// --------------------------------------------------------------

const decoded = decode(validJwt, { complete: true });

if (!decoded) {
  throw new Error("Error decoding test token");
}

describe("handler tests", () => {
  test("func `checkPreflight` should pass through GET requests", async () => {
    // create a deep copy of an event
    const validOriginEvent = require("./events/get-request");
    const event = JSON.parse(validOriginEvent);

    const result = await checkPreflight(event);

    expect(result.status).toBe(undefined);
  });

  test("func `checkPreflight` should respond correctly to OPTIONS requests", async () => {
    // create a deep copy of an event
    const validOriginEvent = require("./events/preflight-request");
    const event = JSON.parse(validOriginEvent);

    // add valid origin header
    event.Records[0].cf.request.headers.origin[0].value = `https://${testAppDomain}`;

    const result = await checkPreflight(event);

    // check correct status
    expect(result.status).toBe(200);

    // check CORS configuration
    expect(result.headers["access-control-allow-origin"][0].value).toBe(
      `https://${testAppDomain}`
    );
    expect(result.headers["access-control-allow-methods"][0].value).toBe(
      "GET, HEAD, OPTIONS"
    );
    expect(result.headers["access-control-allow-headers"][0].value).toBe("*");
  });

  test("func `verifyOrigin` should not allow missing origin", async () => {
    // create a deep copy of an event
    const validOriginEvent = require("./events/valid-origin");
    const event = JSON.parse(validOriginEvent);

    // delete origin header
    delete event.Records[0].cf.request.headers.origin;

    const result = await verifyOrigin(event);

    expect(result.status).toBe(403);
  });

  test("func `verifyOrigin` should not allow invalid origin", async () => {
    // create a deep copy of an event
    const validOriginEvent = require("./events/valid-origin");
    const event = JSON.parse(validOriginEvent);

    // change origin header to invalid domain
    event.Records[0].cf.request.headers.origin[0].value =
      "https://malicious-site.com";

    const result = await verifyOrigin(event);

    expect(result.status).toBe(403);
  });

  test("func `verifyOrigin` should not allow invalid local domain origin", async () => {
    // create a deep copy of an event
    const validOriginEvent = require("./events/valid-origin");
    const event = JSON.parse(validOriginEvent);

    // set invalid local domain
    event.Records[0].cf.request.headers.origin[0].value =
      "http://localhost:9999";
    event.Records[0].cf.request.origin.s3.customHeaders[
      "x-oakwood-web-client-domain"
    ][0].value = testAppDomain;

    const result = await verifyOrigin(event);

    expect(result.status).toBe(403);
  });

  test("func `verifyOrigin` should allow valid app domain origin", async () => {
    // create a deep copy of an event
    const validOriginEvent = require("./events/valid-origin");
    const event = JSON.parse(validOriginEvent);

    // set valid headers
    event.Records[0].cf.request.headers.origin[0].value = `https://${testAppDomain}`;
    event.Records[0].cf.request.origin.s3.customHeaders[
      "x-oakwood-web-client-domain"
    ][0].value = testAppDomain;

    const result = await verifyOrigin(event);

    expect(result.status).toBe(undefined);
  });

  test("func `verifyOrigin` should allow valid local domain origin", async () => {
    // create a deep copy of an event
    const validOriginEvent = require("./events/valid-origin");
    const event = JSON.parse(validOriginEvent);

    // set valid headers
    event.Records[0].cf.request.headers.origin[0].value =
      "http://localhost:3010";
    event.Records[0].cf.request.origin.s3.customHeaders[
      "x-oakwood-web-client-domain"
    ][0].value = testAppDomain;

    const result = await verifyOrigin(event);

    expect(result.status).toBe(undefined);
  });

  test("func `verifyAuth` should not allow unauthorized", async () => {
    const unauthorizedEvent = require("./events/unauthorized");
    const event = JSON.parse(unauthorizedEvent);
    const result = await verifyAuth(event);

    expect(result.status).toBe(401);
  });

  test("func `verifyAuth` should allow authorized", async () => {
    const authorizedEvent = require("./events/authorized");
    const event = JSON.parse(authorizedEvent);

    // set valid headers
    event.Records[0].cf.request.headers.authorization[0].value = validJwt;
    event.Records[0].cf.request.headers.origin[0].value = `https://${testAppDomain}`;
    event.Records[0].cf.request.origin.s3.customHeaders[
      "x-oakwood-web-client-domain"
    ][0].value = testAppDomain;

    // set valid object key
    event.Records[0].cf.request.uri = `/${decoded.payload.username}`;

    const result = await verifyAuth(event);

    expect(result.status).toBe(undefined);
  });

  test("func `main` should not allow missing username directory", async () => {
    const directoryTestsEvent = require("./events/directory-tests");
    const event = JSON.parse(directoryTestsEvent);

    // set valid authorization and referer header
    event.Records[0].cf.request.headers.authorization[0].value = validJwt;
    event.Records[0].cf.request.headers.origin[0].value = `https://${testAppDomain}`;
    event.Records[0].cf.request.origin.s3.customHeaders[
      "x-oakwood-web-client-domain"
    ][0].value = testAppDomain;

    const result = await new Promise((res, rej) => {
      main(event, {}, (something, response) => {
        res(response);
      });
    });

    expect(result.status).toBe(401);
  });

  test("func `main` should not allow a different username directory", async () => {
    const directoryTestsEvent = require("./events/directory-tests");
    const event = JSON.parse(directoryTestsEvent);

    // set valid authorization and referer header
    event.Records[0].cf.request.headers.authorization[0].value = validJwt;
    event.Records[0].cf.request.headers.origin[0].value = `https://${testAppDomain}`;
    event.Records[0].cf.request.origin.s3.customHeaders[
      "x-oakwood-web-client-domain"
    ][0].value = testAppDomain;

    // some other username
    const anotherUsername = "99999-99999-99999-99999-99999";
    event.Records[0].cf.request.uri = `/${anotherUsername}`;

    const result = await new Promise((res, rej) => {
      main(event, {}, (something, response) => {
        res(response);
      });
    });

    expect(result.status).toBe(401);
  });

  test("func `main` should allow username directory", async () => {
    const directoryTestsEvent = require("./events/directory-tests");
    const event = JSON.parse(directoryTestsEvent);

    // set valid authorization and referer header
    event.Records[0].cf.request.headers.authorization[0].value = validJwt;
    event.Records[0].cf.request.headers.origin[0].value = `https://${testAppDomain}`;
    event.Records[0].cf.request.origin.s3.customHeaders[
      "x-oakwood-web-client-domain"
    ][0].value = testAppDomain;

    // current username
    event.Records[0].cf.request.uri = `/${decoded.payload.username}`;

    const result = await new Promise((res, rej) => {
      main(event, {}, (something, response) => {
        res(response);
      });
    });

    expect(result.status).toBe(undefined);
  });
});
