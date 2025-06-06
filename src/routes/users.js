const bcrypt = require("bcryptjs");

const Knex = require('@/tools/Knex');
const userQueries = require('@/queries/users');
const imagableQueries = require('@/queries/imagables');
const { writeImage, removeImage } = require('@/tools/Imager');


const validateUserInput = (user, config) => {
  const errors = {};
  const { email, password, password_confirmation, firstname, lastname, username, phone } = user;

  if (!email) {
    console.error('Error Email')
    errors.email = 'email is required';
  }

  // different behavior for edit
  if (config?.edit) {
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

exports.index = async (req, res) => {
  try {
    userQueries.set();
    const users = await userQueries.get();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
}

exports.store = async (req, res) => {
  const errors = validateUserInput(req.body)

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const cryptedPassword = await bcrypt.hash(req.body.password, 10);

  const trx = await Knex.transaction();
  userQueries.set(trx);
  imagableQueries.set(trx);

  let image = null;

  try {
    const userCreatedId = await userQueries.create({
      ...req.body,
      password: cryptedPassword
    });

    if (userCreatedId) {
      const user = await userQueries.get({ 'usr.id': userCreatedId }).first();

      // save image
      if (req.body.image) {
        image = await writeImage(req.body.image, `users`);

        await imagableQueries.create({
          imagable_id: userCreatedId,
          imagable_type: 'User',
          image_path: image.path,
          image_name: image.name,
        });
      }

      await trx.commit();
      return res.status(200).json(user);
    }
  } catch (error) {
    console.error(error)

    if (image && req.body.image) {
      removeImage(image.path)
    }

    await trx.rollback();
    return res.status(500).json(error);
  }
}

exports.update = async (req, res) => {
  const errors = validateUserInput(req.body, { edit: true })
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const user = req.body;
  if (user.password) {
    user.password = await bcrypt.hash(req.body.password, 10);
  }

  try {
    imagableQueries.set();
    if (req.body.image) {
      if (user.image_path) {
        await removeImage(user.image_path);
        await imagableQueries.delete({ imagable_id: req.body.id, imagable_type: 'User' });
      }

      // create the new image save in disk and db
      const imageSaved = await writeImage(req.body.image, `users`);
      await imagableQueries.create({
        imagable_id: req.body.id,
        imagable_type: 'User',
        image_path: imageSaved.path,
        image_name: imageSaved.name,
      });

      delete req.body.image;
      delete req.body.image_path;
    }

    try {
      userQueries.set();
      const promises = [userQueries.update(req.params.id, user), userQueries.get({ 'usr.id': req.params.id }).first()];

      const [userUpdated, userUpdatedData] = await Promise.all(promises);

      return res.status(200).json(userUpdatedData);
    } catch (error) {
      console.error(error)
      return res.status(500).json(error);
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }

}

exports.delete = async (req, res) => {
  userQueries.set();
  imagableQueries.set();
  try {
    const user = await userQueries.get({ 'usr.id': req.params.id }).first();
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const userDeleted = await userQueries.delete({ id: user.id });
    if (userDeleted > 0) {
      removeImage(user.image_path);
      await imagableQueries.delete({ imagable_id: user.id, imagable_type: 'User' });
      return res.json(userDeleted);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }

}
