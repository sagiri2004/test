const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const handlebars = require("express-handlebars");
const methodOverride = require("method-override");
const port = 3000;
const router = require("./routers/index");

const app = express();

// Middleware
app.use(cors()); // Dùng để giải quyết vấn đề CORS
app.use(express.json()); // Dùng để nhận dữ liệu từ client dưới dạng JSON
app.use(cookieParser()); // Dùng để đọc cookie
app.use(
    express.urlencoded({
      extended: true,
    })
  );
app.use(methodOverride("_method")); // Dùng để gửi request dưới dạng PUT hoặc DELETE
  

dotenv.config(); // Đọc file .env

// Connect to MongoDB
async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/education_dev');
        console.log('Connect successfully!!!');
    } catch (error) {
        console.log('Connect failure!!!');
    }
}
connect();

// Static file
app.use(express.static(path.join(__dirname, "public")));

//template engine
app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    helpers: {
      sum: (a, b) => a + b,
      eq: function (a, b) {
        return a === b;
      },
      isLogin: function(v1, operator, v2, options) {
        switch (operator) {
          case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      }
    },
  })
);

app.use((req, res, next) => {
  // Read refreshToken from cookies
  const refreshToken = req.cookies.refreshToken;

  // Add refreshToken to res.locals
  res.locals.refreshToken = refreshToken;

  next();
});

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));

// Routes
router(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
