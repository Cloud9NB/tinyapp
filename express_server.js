const express = require("express"); //imported express
const bodyParser = require("body-parser"); //imported body parser
const cookieParser = require("cookie-parser");
const app = express(); //setting app to the express function 
const PORT = 8080; // default port 8080

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true})); //using body parser for urlencoding?
app.set("view engine", "ejs"); //setting the view engine to ejs 

function generateRandomString() { // generates random alphanumeric characters
  return Math.random().toString(36).slice(-6);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => { L 
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };   
  res.render("urls_show", templateVars); 
}); 
       
app.get("/u/:shortURL", (req, res) => {  
 const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL)
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => { 
  const longURL = req.body.longURL
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
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

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const username = req.body.username;
  res.clearCookie("username")
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});