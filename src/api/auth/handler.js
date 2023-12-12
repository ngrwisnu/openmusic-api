class AuthHandler {
  constructor(authService, userService, tokenGenerator, validator) {
    this._authService = authService;
    this._userService = userService;
    this._tokenGenerator = tokenGenerator;
    this._validator = validator;
  }

  async postAuthHandler(request, h) {
    this._validator.validateNewAuthPayload(request.payload);

    const { username, password } = request.payload;

    const uid = await this._userService.verifyUserCredentials(
      username,
      password
    );

    const accessToken = await this._tokenGenerator.generateAccessToken({ uid });
    const refreshToken = await this._tokenGenerator.generateRefreshToken({
      uid,
    });

    await this._authService.addRefreshToken(refreshToken);

    const response = h.response({
      status: "success",
      data: {
        accessToken,
        refreshToken,
      },
    });

    response.code(201);
    return response;
  }

  async putAuthHandler(request, h) {
    this._validator.validateUpdateAuthPayload(request.payload);

    const { refreshToken } = request.payload;
    await this._authService.verifyRefreshToken(refreshToken);

    const uid = this._tokenGenerator.verifyRefreshToken(refreshToken);

    const newAccessToken = this._tokenGenerator.generateAccessToken(uid);

    const response = h.response({
      status: "success",
      data: {
        accessToken: newAccessToken,
      },
    });

    response.code(200);
    return response;
  }

  async deleteAuthHandler(request, h) {
    this._validator.validateDeleteAuthPayload(request.payload);

    const { refreshToken } = request.payload;

    await this._authService.verifyRefreshToken(refreshToken);

    await this._authService.deleteRefreshToken(refreshToken);

    const response = h.response({
      status: "success",
      message: "Success deleting refresh token",
    });

    response.code(200);
    return response;
  }
}

export default AuthHandler;
