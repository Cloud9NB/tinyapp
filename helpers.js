const generateRandomString = () => {
  return Math.random().toString(36).slice(-6);
};

const getUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return undefined;
};


const urlsForUser = (id, urlDatabase) => {
  let userUrls = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};