import axios from "axios";
import { Auth } from "aws-amplify";

export class FileUploadService {
  upload(url, file, onUploadProgress) {
    console.log("uploading file");
    // let formData = new FormData();

    // formData.append("file", file);

    return axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress,
    });
  }

  // getFiles() {
  //   return axios.get("/files");
  // }
}

export async function getPrivateImageSrc(url) {
  const token = (await Auth.currentSession()).accessToken.jwtToken;
  const params = {
    headers: {
      Authorization: token,
      // "Cache-Control": "max-age=300",
    },
    responseType: "arraybuffer",
  };

  const response = await axios(url, params);
  const srcBase64 = btoa(
    new Uint8Array(response.data).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );

  return `data:${response.headers[
    "content-type"
  ].toLowerCase()};base64,${srcBase64}`;
}
