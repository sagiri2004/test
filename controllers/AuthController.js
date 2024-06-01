const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

let refreshTokens = [];

class AuthController {
  getRegister(req, res) {
    res.render("register");
  }

  getLogin(req, res) {
    res.render("login");
  }

  async register(req, res) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      // Check username
      const checkUser = await User.findOne({ username: req.body.username });
      if (checkUser) {
        res.render("register", { message: "User already exists!" });
        //return res.status(400).json("User already exists!");
        return;
      }

      // Check email
      const checkEmail = await User.findOne({ email: req.body.email });
      if (checkEmail) {
        res.render("register", { message: "Email already exists!" });
        //return res.status(400).json("Email already exists!");
        return;
      }

      // Create a new user
      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
      });

      // Save user and respond
      newUser.save();
      res.redirect("/");
      //res.status(200).json(newUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      // Find user
      const user = await User.findOne({ username: req.body.username });
      // !user && res.status(400).json("Wrong username!");
      if(!user) {
        res.render("login", { message: "Wrong username!" });
        return;
      }

      // Validate password
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      // !validPassword && res.status(400).json("Wrong password!");
      if(!validPassword) {
        res.render("login", { message: "Wrong password!" });
        return;
      }

      // Respond
      const mySecretKey = "mySecretKey";
      const accessToken = jwt.sign(
        { id: user._id, admin: user.admin },
        //process.env.JWT_SECRET,
        mySecretKey,
        { expiresIn: "3d" }
      );
      const refreshToken = jwt.sign(
        { id: user._id, admin: user.admin },
        //process.env.JWT_SECRET,
        mySecretKey,
        { expiresIn: "365d" }
      );

      refreshTokens.push(refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        //path: "/auth/refresh_token",
        sameSite: "strict",
      });

      // res.status(200).json({ user, accessToken });
      res.redirect("/");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // redis
  refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(403).json("User not logged in!");

    if (!refreshTokens.includes(refreshToken))
      return res.status(403).json("Refresh token is not valid!");

    jwt.verify(refreshToken, "mySecretKey", (err, user) => {
      if (err) console.log(err);

      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

      const newAccessToken = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        "mySecretKey",
        { expiresIn: "30s" }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        "mySecretKey",
        { expiresIn: "365d" }
      );

      refreshTokens.push(newRefreshToken);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        path: "/auth/refresh_token",
        sameSite: "strict",
      });
      console.log("New refresh token: ", newRefreshToken);

      res.status(200).json({ accessToken: newAccessToken });
    });
  }

  logout(req, res) {
    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken
    );
    res.clearCookie("refreshToken");
    //res.status(200).json("You logged out!");
    res.redirect("/");
  }
}

module.exports = new AuthController();
