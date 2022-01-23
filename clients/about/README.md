# TODO

- change getAuthUrl() to use aws-exports.json from workspace's S3 bucket

## Adding Pages

New pages need to be added to this client's Lambda@Edge function in `terraform/frontend/about-client-lambda-edge`. This is necessary because of how Gatsby renders its pages. Here's how to do it:

1. Open up `terraform/frontend/about-client-lambda-edge/handler.js`
1. Edit the variable at the top `GATSBY_PAGE_LIST` to include your new page and save
1. From `terraform/frontend`, run `make build`
1. Terraform plan/apply as usual