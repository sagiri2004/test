const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");
const userMiddleware = require("../middleware/UserMiddleware");

router.get("/register", authController.getRegister);
router.post("/register", authController.register);
router.get("/login", authController.getLogin);
router.post("/login", authController.login);
router.post("/refresh_token", authController.refreshToken);
//router.get("/logout", authController.getLogout);
// router.post("/logout", userMiddleware.verifyToken, authController.logout);
router.post("/logout", authController.logout);

module.exports = router;
