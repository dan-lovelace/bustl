module.exports = JSON.stringify({
  Records: [
    {
      cf: {
        config: {
          distributionDomainName: "d3mmnkn95d0vb8.cloudfront.net",
          distributionId: "E2VUISK709VA0B",
          eventType: "origin-request",
          requestId: "q1QtWlnZoM3iSjQI0Mx7vLV8bWu0cO3eXYEp7GpTKILHqlAwziXc0Q==",
        },
        request: {
          clientIp: "24.128.106.48",
          headers: {
            authorization: [
              {
                key: "Authorization",
                value:
                  "yJraWQiOiJ3ZmFoMVh3dUlOK2d6VSsxdEtPdzZIdzErdE5qeWJ2dmFDOGFqaXpKWkJNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4YzBjOWExZi04YzUxLTRkNjUtODZiMS1iNWU4OGY3NWFmOWEiLCJjb2duaXRvOmdyb3VwcyI6WyJzeXN0ZW0tdXNlciJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl9oakNncUxHUWUiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiJ0azhyZXYxbGFzaDQ2dGltMG8zbmhyMnU2IiwiZXZlbnRfaWQiOiI5M2I3Njk3ZS1kYjk2LTQ0MTUtYjA2ZS1iNzYxZDUxNGI2N2QiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIG9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXV0aF90aW1lIjoxNjEwOTIxOTQwLCJleHAiOjE2MTA5Mzg0MDcsImlhdCI6MTYxMDkzNDgwNywianRpIjoiM2E0ZDkxYzgtMzM3MC00ODM2LWI3ZTgtODE4NWNjYjgzZThmIiwidXNlcm5hbWUiOiI4YzBjOWExZi04YzUxLTRkNjUtODZiMS1iNWU4OGY3NWFmOWEifQ.s9utDf1tFHxsVA8k4AnLvmYGNd7bbBSyyK6FvvmSzgiCcka38QsWlHaAM10JIxbMBOLKtFmiEVGf3x8vzSitFhgE50gkDLQwVc5JOftwMY3A3GDPBjropfPjGghVy7TavGLawgKBCwehOOScvGrZySW7eCBJdev1MoT7w3Cxx75CH23H6E4ZwYHBuMXxamTHDo_hwPhtej6_m2oed6KMn9o8GfII3enc91Rz-7mom_RH94B0xrk8kK-y1ONirXe1pzEXXglCd2w5ugIOML0ZrHR9UiVchM0oGlEq69QjKkjYXVUs70eYANak9yX4WzC1DqbcnSwlmD6z37AEXKic4Q",
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
                  "2.0 60a33b3ee10b817d4c26e943f253cb0c.cloudfront.net (CloudFront)",
              },
            ],
            "accept-encoding": [{ key: "Accept-Encoding", value: "gzip" }],
            origin: [{ key: "origin", value: "http://localhost:3010" }],
            dnt: [{ key: "dnt", value: "1" }],
            pragma: [{ key: "Pragma", value: "no-cache" }],
            host: [
              {
                key: "Host",
                value:
                  "oakwood-user-uploads-development.s3.us-east-2.amazonaws.com",
              },
            ],
            "cache-control": [{ key: "Cache-Control", value: "no-cache" }],
          },
          method: "GET",
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
