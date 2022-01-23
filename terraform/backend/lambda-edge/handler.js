/*

This function restricts bucket access to the current user's objects by verifying
their Cognito JWT and extracting the username.

*/
const { decode, verify } = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const fetch = require("node-fetch");

// cache this here to use in later invocations
let jwksRsa;

// this is an origin-request trigger so only return a response if something goes wrong
const createResponse = (statusCode, body, options = {}) => ({
  status: statusCode,
  headers: {
    "content-type": [
      {
        key: "Content-Type",
        value: "text/html",
      },
    ],
    "access-control-allow-origin": [
      {
        key: "Access-Control-Allow-Origin",
        value: options.allowOrigin || "*",
      },
    ],
    "access-control-allow-methods": [
      {
        key: "Access-Control-Allow-Methods",
        value: "GET, HEAD, OPTIONS",
      },
    ],
    "access-control-allow-headers": [
      {
        key: "Access-Control-Allow-Headers",
        value: "*",
      },
    ],
    // TODO: cache-control??
  },
  body,
});

function getResponseAllowOrigin(event) {
  const { request } = event.Records[0].cf;
  let responseAllowOrigin = "*";

  if (request.headers.origin && request.headers.origin.length) {
    responseAllowOrigin = request.headers.origin[0].value;
  }

  return responseAllowOrigin;
}

const invalidOriginResponse = (event, message = false) => {
  const bodyMessage = message && message.length > 0 ? `<p>${message}</p>` : "";
  const body = `
    <div>
      <h1>403</h1>
      <p>Forbidden</p>
      ${bodyMessage}
    </div>
  `;

  return createResponse(403, body, {
    allowOrigin: getResponseAllowOrigin(event),
  });
};

// build a generic, consistent response to use if something goes wrong
const invalidAuthResponse = (event, message = false) => {
  const body = `
    <div>
      <h1>401</h1>
      <p>Not authorized</p>
      ${
        message && message.length > 0
          ? `
            <p>
              ${message}
            </p>
          `
          : ""
      }
    </div>
  `;

  return createResponse(401, body, {
    allowOrigin: getResponseAllowOrigin(event),
  });
};

async function getSigningKey(kid, awsExportsDomain) {
  // retrieves the public key that corresponds to the private key with which the token was signed

  if (!jwksRsa) {
    // not cached, get user pool id and region from web app aws-exports.json
    const filename = "aws-exports.json";

    // get aws-exports.json
    const result = await fetch(`https://${awsExportsDomain}/${filename}`);
    const resultJson = await result.json();

    // build jwksUri using pool id and region
    const {
      Auth: { userPoolId, region },
    } = resultJson;
    const jwksUri = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

    // initialize and cache the client
    jwksRsa = jwksClient({ cache: true, rateLimit: true, jwksUri });
  }

  return new Promise((resolve, reject) =>
    jwksRsa.getSigningKey(kid, (err, jwk) =>
      err ? reject(err) : resolve(jwk.publicKey || jwk.rsaPublicKey)
    )
  );
}

module.exports.verifyAuth = async (event) => {
  const { request } = event.Records[0].cf;
  const { headers, origin } = request;

  try {
    // get header values
    const authHeader = headers["authorization"];
    const appDomainHeader =
      origin.s3.customHeaders["x-oakwood-web-client-domain"];

    const token = authHeader[0].value.trim();
    const appDomain = appDomainHeader[0].value.trim();

    // decode to get key id (kid)
    const decoded = decode(token, { complete: true });
    if (!decoded) {
      throw new Error("Failed to decode token");
    }

    // try to get signing key
    const kid = decoded.header.kid;
    const jwk = await getSigningKey(kid, appDomain);

    // setup verify options using audience (cognito client_id) and issuer
    const verifyOptions = {
      aud: decoded.payload.client_id,
      issuer: decoded.payload.iss,
    };

    // verify jwt and return result
    const result = verify(token, jwk, verifyOptions);

    return result;
  } catch (e) {
    console.log("auth error:", e);
    return invalidAuthResponse(
      event,
      `
        auth error: ${e.toString()}
        event: ${JSON.stringify(event)}
      `
    ); // e.toString()
  }
};

module.exports.verifyOrigin = async (event) => {
  const { request } = event.Records[0].cf;
  const { headers, origin: cfOrigin } = request;

  try {
    const originHeader = headers.origin;
    const appDomainHeader =
      cfOrigin.s3.customHeaders["x-oakwood-web-client-domain"];

    const origin = originHeader[0].value.trim();
    const appDomain = appDomainHeader[0].value.trim();

    const allowedOrigins = [
      `https://${appDomain}`,
      "http://localhost:3010", // TODO
    ];

    if (!allowedOrigins.includes(origin)) {
      throw new Error("Invalid origin");
    }

    return true;
  } catch (e) {
    console.log("origin error:", e);
    return invalidOriginResponse(event, e.toString());
  }
};

module.exports.checkPreflight = async (event) => {
  const { request } = event.Records[0].cf;
  const { method } = request;

  try {
    if (method === "OPTIONS") {
      return createResponse(200, "Success", {
        allowOrigin: getResponseAllowOrigin(event),
      });
    }

    return true;
  } catch (e) {
    const body = `
      <div>
        <h1>500</h1>
        <p>Internal server error</p>
      </div>
    `;

    return createResponse(500, body, {
      allowOrigin: getResponseAllowOrigin(event),
    });
  }
};

module.exports.main = async (event, context, callback) => {
  // this might break something btw
  console.log("processing event", JSON.stringify(event));

  // verify origin
  const originResult = await this.verifyOrigin(event);
  if (originResult.status) {
    return callback(null, originResult);
  }

  // return success and empty body for preflight requests
  const preflightResult = await this.checkPreflight(event);
  if (preflightResult.status) {
    return callback(null, preflightResult);
  }

  // verify authorization
  const authResult = await this.verifyAuth(event);
  if (authResult.status) {
    return callback(null, authResult);
  }

  try {
    // validate requested directory
    const { request } = event.Records[0].cf;
    const { uri } = request;
    const { username } = authResult;
    const userDirectory = `/${username}`;

    // disallow access to other user directories
    if (!uri.startsWith(userDirectory)) {
      return callback(null, invalidAuthResponse(event, "Invalid user"));
    }

    // all good, allow request to continue
    return callback(null, request);
  } catch (e) {
    const body = `
      <div>
        <h1>500</h1>
        <p>Internal server error</p>
      </div>
    `;

    return callback(null, createResponse(500, body));
  }
};
