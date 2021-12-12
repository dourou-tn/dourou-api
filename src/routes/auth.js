const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = require('express').Router();

const userQueries = require('@/queries/users');

const authMiddleware = require('@/middlewares/auth');

router.post('/register', async (req, res) => {
  const { email, password, password_confirmation, username, firstname, lastname, phone } = req.body

  if (!email) {
    console.error('Error Email')
    return res.status(400).json({ code: 400, error: 'email is required' });
  }

  if (!password) {
    console.error('Error password')
    return res.status(400).json({ code: 400, error: 'password is required' });
  }

  if (password !== password_confirmation) {
    console.error('Error password_confirmation')
    return res.status(400).json({ code: 400, error: 'password_confirmation need to be same as password' });
  }

  if (!username) {
    console.error('Error username')
    return res.status(400).json({ code: 400, error: 'username is required' });
  }

  if (!firstname) {
    console.error('Error firstname')
    return res.status(400).json({ code: 400, error: 'firstname is required' });
  }

  if (!lastname) {
    console.error('Error lastname')
    return res.status(400).json({ code: 400, error: 'lastname is required' });
  }

  if (!phone) {
    console.error('Error phone')
    return res.status(400).json({ code: 400, error: 'phone is required' });
  }

  const cryptedPassword = await bcrypt.hash(password, 10);

  userQueries.set();

  await userQueries.create({
    email,
    username,
    firstname,
    lastname,
    phone,
    role_id: 2,
    password: cryptedPassword,
  });

  const [user] = await userQueries.get({ email });

  const token = jwt.sign(
    { user: user },
    process.env.JWT_TOKEN_KEY,
    { expiresIn: "2h" },
  );

  user.token = token;
  return res.status(201).json({ success: true, data: user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    console.error('Error Email');
    return res.status(400).json({ error: 'email is required' });
  }

  if (!password) {
    console.error('Error password');
    return res.status(400).json({ error: 'password is required' });
  }

  try {
    userQueries.set();
    let [user] = await userQueries.get({ email: email }, true);
    if (user) {
      const samePassword = await bcrypt.compare(password, user.password.toString())
      if (samePassword) {
        delete user.password; // dont send password to client
        const token = jwt.sign(
          { user: user },
          process.env.JWT_TOKEN_KEY,
          { expiresIn: "2h" },
        );
        return res.status(200).json({ user: user, token: token });
      }
    }

    return res.status(400).json({ error: 'Invalid user email or password ' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'fqq' })
  }

})

router.get('/user', authMiddleware, async (req, res) => {
  userQueries.set();
  const user = await userQueries.get({ id: req.user.id });
  res.json({ user: user }).status(200);
})

module.exports = router;
