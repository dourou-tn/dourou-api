const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userQueries = require('@/queries/users');
const Error = require('./../tools/Error');

exports.register = async (req, res) => {
  const { email, password, password_confirmation, username, firstname, lastname, phone } = req.body

  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  if (!password_confirmation ||password_confirmation !== password) {
    errors.password_confirmation = 'password_confirmation need to be same as password';
  }

  if (!username) {
    errors.username = 'Username is required';
  }

  if (!firstname) {
    errors.firstname = 'Firstname is required';
  }

  if (!lastname) {
    errors.lastname = 'Lastname is required';
  }

  if (!phone) {
    errors.phone= 'Phone is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(Error(400, 'Invalid data', errors));
  }

  try {
    const cryptedPassword = await bcrypt.hash(password, 10);
    userQueries.set();
    // check if no user with phone or email exists in db
    const usersWithSameCredentials = await userQueries.get({ 'usr.email': email }).orWhere({ 'usr.phone': phone });
    if (usersWithSameCredentials.length) {
      return res.status(400).json(Error(400, `Email: ${email} or Phone: ${phone} already exists`));
    }
    const [userCreatedId] = await userQueries.create({
      email,
      username,
      firstname,
      lastname,
      phone,
      role_id: 2,
      password: cryptedPassword,
    });

    const user = await userQueries.get({ 'usr.id': userCreatedId }).first();

    const token = jwt.sign(
      { user: user },
      process.env.JWT_TOKEN_KEY,
      { expiresIn: "2h" },
    );

    user.token = token;
    return res.status(200).json({ success: true, message: 'User created successfully', data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error })
  }

}

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const errors = {};
  if (!email) {
    errors.email = 'email_is_required';
  }
  if (!password) {
    errors.password = 'password_is_required';
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(Error(400, 'Invalid data', errors));
  }

  try {
    userQueries.set();
    const user = await userQueries.get({ email: email }, true).first();
    if (user) {
      const samePassword = await bcrypt.compare(password, user.password.toString())
      if (samePassword) {
        delete user.password; // dont send password to client
        const token = jwt.sign(
          { user: user },
          process.env.JWT_TOKEN_KEY,
          { expiresIn: "2h" },
        );
        return res.status(200).json({ success: true, user: user, token: token });
      }
    }

    return res.status(400).json(Error(400, 'invalid_email_or_password'));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'fqq' })
  }

}

exports.user = async (req, res) => {
  try {
    userQueries.set();
    const user = await userQueries.get({ 'usr.id': req.user.id }).first();
    res.json({ user: user }).status(200);
  } catch (error) {
    console.error(error);
    return res.json(Error(500, 'Internal server error'));
  }
}
