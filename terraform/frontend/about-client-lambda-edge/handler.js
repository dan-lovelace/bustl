const GATSBY_PAGE_LIST = ["contact", "privacy", "product", "terms"];

module.exports.main = async (event, context, callback) => {
  try {
    const { request } = event.Records[0].cf;
    let uri = request.uri;

    // check to see if user is trying to access a gatsby page
    if (GATSBY_PAGE_LIST.some((page) => uri.startsWith(`/${page}`))) {
      const indexFile = "/index.html";

      // remove trailing forward slash if it exists
      if (uri.endsWith("/")) {
        uri = uri.slice(0, -1);
      }

      // append index file
      request.uri = `${uri}${indexFile}`;
    }

    return callback(null, request);
  } catch (e) {
    const body = `
      <div>
        <h1>500</h1>
        <p>Internal server error</p>
        <p>Error at edge. Please contact site administrator.</p>
      </div>
    `;

    return callback(null, {
      statusCode: 500,
      body,
    });
  }
};
