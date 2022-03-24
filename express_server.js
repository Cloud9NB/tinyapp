const PORT = 8080;
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// CONFIG
const app = express();
app.set("view engine", "ejs");

app.use(cookieParser());

// DATA BASE
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: true }));

// Helper Functions
function generateRandomString() {
  return Math.random().toString(36).slice(-6);
}

//doesnt work
const findDuplicateEmails = function (email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

// ROUTES
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("registration", templateVars)
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("login_form", templateVars)
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };

  if (!templateVars.user) {
    res.redirect("/urls")
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.redirect(longURL, templateVars)
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.send(400, "That is not a valid email or password")
    return;
  }
  if (findDuplicateEmails(email, users)) {
    res.send(400, "This email already exist.")
    return;
  }
  users[id] = {
    id,
    email,
    password
  };
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post('/login', (req, res) => {
  const user = findDuplicateEmails(req.body.email, users);
  if (user) {
    if (req.body.password === user.password) {
      res.cookie('user_id', user.id);
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.send('403 Status Code. You entered the wrong password.')
    }
  } else {
    res.statusCode = 403;
    res.send('403 Status Code. This email address is not registered.')
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});