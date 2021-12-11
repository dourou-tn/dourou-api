const bcrypt = require("bcryptjs");

const router = require('express').Router();
const userQueries = require('@/queries/users');

const validateUserInput = (user, config) => {
  const errors = {};
  const { email, password, password_confirmation, firstname, lastname, username, phone } = user;

  if (!email) {
    console.error('Error Email')
    errors.email = 'email is required';
  }

  // different behavior for edit
  if (config.edit) {
    if (password && password.lenght < 8) {
      errors.password = 'password must be at least 8 characters';
    }
    if (password && password !== password_confirmation) {
      errors.password_confirmation = 'passwords must match';
    }
  } else {
    if (!password) {
      console.error('Error password')
      errors.email = 'password is required';
    }
    if (password !== password_confirmation) {
      console.error('Error password_confirmation')
      errors.password_confirmation = 'password_confirmation need to be same as password';
    }
  }

  if (!username) {
    console.error('Error username')
    errors.username = 'username is required';
  }

  if (!firstname) {
    console.error('Error firstname')
    errors.firstname = 'firstname is required';
  }

  if (!lastname) {
    console.error('Error lastname')
    errors.lastname = 'lastname is required';
  }

  if (!phone) {
    console.error('Error phone')
    errors.phone = 'phone is required';
  }

  return errors;
}

exports.validateUserInput = validateUserInput;

// get all users
router.get('/', async (req, res) => {
  try {
    const users = await userQueries.get();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

router.post('/', async (req, res) => {
  const errors = validateUserInput(req.body)

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const cryptedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    const userCreatedId = await userQueries.create({
      ...req.body,
      password: cryptedPassword
    });

    if (userCreatedId) {
      const user = await userQueries.get({ id: userCreatedId}).first();
      return res.status(200).json(user);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
})

router.put('/:id', async (req, res) => {
  const errors = validateUserInput(req.body, { edit: true })
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const user = req.body;
  if (user.password) {
    user.password = await bcrypt.hash(req.body.password, 10);
  }

  try {
    const userUpdated = await userQueries.update(req.params.id, user);
    return res.status(200).json(userUpdated);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }

})
module.exports = router;
