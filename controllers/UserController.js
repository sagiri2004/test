const User = require("../models/User");
const jwt = require("jsonwebtoken");

class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteUser(req, res) {
    const myToken = req.cookies.refreshToken;
    if (myToken) {
      jwt.verify(myToken, "mySecretKey", async (err, user) => {
        if (err) {
          res.render("home");
          console.log("Error");
        } else {
          try {
            const userToDelete = await User.findById(req.params.id);
            // console.log(user.id);
            // console.log(typeof user.id);
            // console.log(userToDelete._id.toString());
            // console.log(typeof userToDelete._id.toString());
            if (user.admin || user.id.toString() === userToDelete._id.toString()) {
              //console.log("Delete user 2");
              await userToDelete.deleteOne();
              // ve lai trang home
              if(user.id.toString() === userToDelete._id.toString()){
                // xoa cookie
                res.clearCookie("refreshToken");
              }
              res.redirect("/");
            } else {
              res.status(403).json({ message: "You are not authorized to delete this user." });
            }
          } catch (error) {
            res.status(500).json({ message: error.message });
          }
        }
      });
    }
  }
}

module.exports = new UserController();
