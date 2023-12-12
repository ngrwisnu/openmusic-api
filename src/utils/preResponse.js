import ClientError from "../middleware/error/ClientError.js";

const preResponse = (request, h) => {
  const { response } = request;

  if (response instanceof Error) {
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });

      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (!response.isServer) return h.continue;

    const newResponse = h.response({
      status: "error",
      message: response.message, //NOTE: use response.message for debugging
    });

    newResponse.code(500);
    return newResponse;
  }

  return h.continue;
};

export default preResponse;
