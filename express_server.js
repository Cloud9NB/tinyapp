const PORT = 8080;
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');

// CONFIG
const app = express();
app.set("view engine", "ejs");

app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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

// 3 Helper Functions
const generateRandomString = () => {
  return Math.random().toString(36).slice(-6);
}

const findDuplicateEmails = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

const urlsForUser = (id) => {
  let userUrls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
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

  const user = users[req.cookies["user_id"]];
  
  if (user) {
   return res.redirect('/urls')
  }
  res.render("registration", templateVars)
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };

  const user = users[req.cookies["user_id"]];
   if (user) {
    return res.redirect('/urls');
   }
  res.render("login_form", templateVars)
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlsForUser(req.cookies["user_id"])
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
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]]
  };

  const user = users[req.cookies["user_id"]];
  if (!user) {
   return res.send('You have no access here!');
  }

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.send(302);
  }

  const user = users[req.cookies["user_id"]];
  
  if (!user) {
   return res.send('You have no access here!');
  }
  res.redirect(longURL);
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };

  const user = users[req.cookies["user_id"]];

  if (!user) {
   return res.send('You have no access here!');
  }
  res.render("urls_show", templateVars);
});


// POST
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password);
  
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
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = req.cookies['user_id'];

  const user = users[req.cookies["user_id"]];
  
  if (!user) {
   return res.redirect('/urls/register');
  }
res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = {
    longURL: req.body.newURL,
    userID: req.cookies['user_id']};
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.send('Please log in');
  }
  res.redirect('/urls');
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;

  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.send('Please log in');
  }
  res.redirect("/urls");
});

app.post('/login', (req, res) => {
  const user = findDuplicateEmails(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
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