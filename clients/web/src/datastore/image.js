import { gql } from "@apollo/client";
import axios from "axios";

const IMAGE_UPLOAD_REQUEST = gql`
  query ImageUploadRequest($file: File!) {
    image_upload(file: $file) {
      form_json
      upload_url
    }
  }
`;

const CREATE_IMAGE = gql`
  mutation CreateImage($input: CreateImageInput!) {
    createImage(input: $input) {
      id
    }
  }
`;

export default async function imageData(client, operation, params) {
  switch (operation) {
    case "CREATE_WITH_FILE": {
      // define file and metadata
      const { file } = params;
      const { name: filename, type: fileType } = file;

      // fetched values
      let formJson;
      let uploadUrl;
      let imageId;

      // 1 - get new upload url
      try {
        // query upload request
        const uploadUrlQuery = await client.query({
          fetchPolicy: "network-only", // get a new one each time
          query: IMAGE_UPLOAD_REQUEST,
          variables: {
            file: {
              name: filename,
              content_type: fileType,
            },
          },
        });

        // parse out form data json and upload url
        const {
          data: {
            image_upload: { form_json, upload_url },
          },
        } = uploadUrlQuery;

        // update fetched value vars
        uploadUrl = upload_url;
        formJson = JSON.parse(form_json);
      } catch (e) {
        throw new Error(e);
      }

      // 2 - POST file to url
      try {
        // construct form data from upload request
        let formData = new FormData();
        Object.keys(formJson).forEach((key, idx) =>
          formData.append(key, formJson[key])
        );

        // always append file last
        formData.append("file", file);

        // send it, do not set content-type header
        await axios.post(uploadUrl, formData);
      } catch (e) {
        throw new Error(e);
      }

      // 3 - create image object
      try {
        // call the image create mutation with file name in formJson
        const createImageMutation = await client.mutate({
          mutation: CREATE_IMAGE,
          variables: {
            input: {
              key: formJson["key"],
            },
          },
        });

        // parse out new id
        const {
          data: {
            createImage: { id },
          },
        } = createImageMutation;

        // update fetched vars
        imageId = id;
      } catch (e) {
        throw new Error(e);
      }

      return imageId;
    }

    default:
      throw new Error("Invalid data operation on [Image]");
  }
}
