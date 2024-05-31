import axios from "axios";
export default function requestApi(
  endpoint,
  method,
  body,
  responseType = "json",
  contentType = "application/json"
) {
  const headers = {
    Accept: "application/json",
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
  };
  const instance = axios.create({ headers });
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  return instance.request({
    method: method,
    url: `${process.env.REACT_APP_API_URL}${endpoint}`,
    data: body,
    responseType: responseType,
  });
}
