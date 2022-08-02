const toQueryString = (params) =>
  Object.entries(params)
    .map((kv) => kv.map(encodeURIComponent).join("="))
    .join("&");

export default async function callAPI(
  endpoint,
  method,
  params,
  successMessage
) {
  console.log("API call:", endpoint, method, params);

  const response = await fetch(
    "/api/v1/" + endpoint + (params ? "?" + toQueryString(params) : ""),
    { headers: { Authorization: window.user.token }, method: method }
  );

  const status = response.status;
  var success = status.toString().startsWith("2");
  var json = success && status !== 204 && (await response.json());

  if (success) {
    if (successMessage) {
      window.makeAlert(successMessage, "success");
    }
  } else {
    const makeError = (error) => window.makeAlert(error, "error");

    switch (status) {
      case 400:
        makeError("Bad request. If this is an error, try contacting Ben");
        break;
      case 401:
        makeError("Invalid token, try signing in again");
        delete localStorage.quakeUser;
        window.location.reload();
        break;
      case 403:
        makeError(
          "Insufficient permissions, refreshing permissions now. If this is an error persists, try contacting Ben"
        );
        var permissionsResponse = await callAPI("users/me", "GET");
        if (permissionsResponse.success) {
          window.setUser((prev) => ({
            ...prev,
            permissions: permissionsResponse.json.permissions,
          }));
        }
        break;
      case 404:
        makeError(
          "Resource not found. If this is an error, try contacting Ben"
        );
        break;
      case 405:
        makeError("Invalid endpoint. If this is an error, try contacting Ben");
        break;
      default:
        makeError("Unknown error " + status + ", try contacting Ben");
    }
  }

  return { status, success, json };
}

window.callAPI = callAPI;
