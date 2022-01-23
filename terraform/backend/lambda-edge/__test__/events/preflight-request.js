module.exports = JSON.stringify({
  Records: [
    {
      cf: {
        config: {
          distributionDomainName: "d3mmnkn95d0vb8.cloudfront.net",
          distributionId: "E2VUISK709VA0B",
          eventType: "origin-request",
          requestId: "sHRUcMN0AiPA0HVrM6G-UQ7L9hiVBOKEPYLNl-Sf2uQsAMakxyTbdA==",
        },
        request: {
          clientIp: "24.128.106.48",
          headers: {
            host: [
              {
                key: "Host",
                value:
                  "oakwood-user-uploads-development.s3.us-east-2.amazonaws.com",
              },
            ],
            "x-forwarded-for": [
              { key: "X-Forwarded-For", value: "24.128.106.48" },
            ],
            "user-agent": [{ key: "User-Agent", value: "Amazon CloudFront" }],
            via: [
              {
                key: "Via",
                value:
                  "1.1 e1576caf66a5cd72c201a5b34cd36471.cloudfront.net (CloudFront)",
              },
            ],
            "accept-encoding": [
              { key: "accept-encoding", value: "gzip, deflate, br" },
            ],
            "access-control-request-method": [
              { key: "access-control-request-method", value: "GET" },
            ],
            "access-control-request-headers": [
              { key: "access-control-request-headers", value: "authorization" },
            ],
            origin: [{ key: "origin", value: "" }], // generated when running tests
            dnt: [{ key: "dnt", value: "1" }],
            pragma: [{ key: "pragma", value: "no-cache" }],
            "cache-control": [{ key: "cache-control", value: "no-cache" }],
          },
          method: "OPTIONS",
          origin: {
            s3: {
              authMethod: "origin-access-identity",
              customHeaders: {
                "x-oakwood-web-client-domain": [
                  { key: "x-oakwood-web-client-domain", value: "dev.bus.tl" },
                ],
              },
              domainName:
                "oakwood-user-uploads-development.s3.us-east-2.amazonaws.com",
              path: "",
              region: "us-east-2",
            },
          },
          querystring: "",
          uri: "/8c0c9a1f-8c51-4d65-86b1-b5e88f75af9a/IMG_0071.JPG",
        },
      },
    },
  ],
});
