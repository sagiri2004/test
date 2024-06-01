const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

class SiteController {
  // [GET] /
  index(req, res) {
    const myToken = req.cookies.refreshToken
    if (myToken) {
      jwt.verify(myToken, "mySecretKey", (err, user) => {
        if (err) {
          res.render("home");
        }
        else{
          if(user.admin){
            // se lay ra toan bo user trong database
            const User = mongoose.model("User");
            User.find({})
            .then((users) => {
              const usersWithoutPassword = users.map(user => {
                const userObject = user.toObject();
                const { password, ...userWithoutPassword } = userObject;
                return userWithoutPassword;
              });
              //console.log(usersWithoutPassword);
              res.render("home", { users: usersWithoutPassword });
            })
            .catch((err) => {
              console.log(err);
              res.render("home");
            });
          }else{
            // lay ra du lieu thu id trong token roi tim trong database va in ra toan bo thong tin cua user
            const User = mongoose.model("User");
            User.findById(user.id)
              .then((user) => {
                //console.log(user);
                const { password, ...userWithoutPassword } = user.toObject();
                res.render("home", { users: [userWithoutPassword] });
              })
              .catch((err) => {
                console.log(err);
                res.render("home");
              });
          }
          //console.log(user);
          // lay ra du lieu thu id trong token roi tim trong database va in ra toan bo thong tin cua user
          // const User = mongoose.model("User");
          // User.findById(user.id)
          //   .then((user) => {
          //     console.log(user);
          //     const { password, ...userWithoutPassword } = user.toObject();
          //     res.render("home", { users: [userWithoutPassword] });
          //   })
          //   .catch((err) => {
          //     console.log(err);
          //     res.render("home");
          //   });
        }
      });
    }
    else{
      res.render("home");
    }
  }

}

module.exports = new SiteController();
