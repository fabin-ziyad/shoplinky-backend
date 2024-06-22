const User = require("../models/user");
const firebaseAdmin = require("../config/firebase");

module.exports = {
  async verify(req, res, next) {
    if (req.headers && req.headers.authorization) {
      try {
        let receivedIdToken = req.headers.authorization;
        receivedIdToken = receivedIdToken.split(" ");

        const decodedToken = await firebaseAdmin
          .auth()
          .verifyIdToken(receivedIdToken[receivedIdToken.length - 1]);
        // console.log("decoded token", decodedToken);
        if (decodedToken && decodedToken.uid)
          req.token = { ...decodedToken, user: decodedToken.uid };
        if (decodedToken && decodedToken.isAdmin)
          req.token = { ...req.token, admin: decodedToken.uid };

        // we require to set uid on user collection to get user data
        if (decodedToken && decodedToken.uid) {
          const getUserData = await User.findOne({ uid: decodedToken?.uid });
          if (!getUserData) {
            return res.status(400).json({
              success: false,
              message: "You are not registered with us",
            });
          }
          req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            id: getUserData?._id,
          };
        }
        next(); // Forward the request.
      } catch (err) {
        console.error(err?.message);
        return res.status(500).json({
          ...err,
          message: "Failed to authenticate token!",
        });
      }
    } else {
      return res.status(500).json({
        message: "Failed to authenticate token!",
      });
    }
  },
  extractTokenData: (requestData) => {
    try {
      if (requestData && requestData.token) {
        const obj = {
          email: requestData.toke.email,
          uid: requestData.token.uid,
        };
        return obj;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  },
};
