module.exports = JSON.stringify({
  Records: [
    {
      cf: {
        config: {
          distributionDomainName: "d111111abcdef8.cloudfront.net",
          distributionId: "EDFDVBD6EXAMPLE",
          eventType: "origin-request",
          requestId:
            "4TyzHTaYWb1GX1qTfsHhEqV6HUDd_BzoBZnwfnvQc_1oF26ClkoUSEQ==",
        },
        request: {
          clientIp: "203.0.113.178",
          headers: {
            authorization: [
              {
                key: "Authorization",
                value: "", // generated when running test
              },
            ],
            origin: [
              {
                key: "Origin",
                value: "", // generated when running test
              },
            ],
            "x-forwarded-for": [
              {
                key: "X-Forwarded-For",
                value: "203.0.113.178",
              },
            ],
            "user-agent": [
              {
                key: "User-Agent",
                value: "Amazon CloudFront",
              },
            ],
            via: [
              {
                key: "Via",
                value:
                  "2.0 2afae0d44e2540f472c0635ab62c232b.cloudfront.net (CloudFront)",
              },
            ],
            host: [
              {
                key: "Host",
                value: "example.org",
              },
            ],
            "cache-control": [
              {
                key: "Cache-Control",
                value: "no-cache, cf-no-cache",
              },
            ],
          },
          method: "GET",
          origin: {
            s3: {
              authMethod: "origin-access-identity",
              customHeaders: {
                "x-oakwood-web-client-domain": [
                  {
                    key: "X-Oakwood-Web-Client-Domain",
                    value: "", // generated when running test
                  },
                ],
              },
              domainName:
                "oakwood-user-uploads-development.s3.us-east-2.amazonaws.com",
              path: "",
              region: "us-east-2",
            },
          },
          querystring: "",
          uri: "/", // generated when running test
        },
      },
    },
  ],
});
