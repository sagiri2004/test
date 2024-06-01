const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
// const userMiddleware = require("../middleware/UserMiddleware");

//router.get("/delete/", userController.deleteUser);
router.delete("/delete/:id", userController.deleteUser);
router.get("/", userController.getAllUsers);
//router.delete("/delete/:id", userMiddleware.verifyTokenAndAuthorization, userController.deleteUser);


module.exports = router;
