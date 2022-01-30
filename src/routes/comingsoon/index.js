const Knex = require('@/tools/Knex');
const moment = require('moment');

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ) ? true : false;
}

exports.newsletter = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    console.error('email_is_required');
    return res.status(400).json({ success: false, message: 'email_is_required', data: {} });
  }

  if (!validateEmail(email)) {
    console.error('email_is_malformated');
    return res.status(400).json({ success: false, message: 'email_is_required', data: {} });
  }

  try {
    const response = await Knex('comingsoon_newsletter').insert({
      email,
      created_at: moment().format('YY-MM-DD HH:mm:ss'),
      updated_at: moment().format('YY-MM-DD HH:mm:ss'),
    });
    return res.status(200).json({ success: true, data: {} });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('email_already_exists');
      return res.status(400).json({ success: false, message: 'email_already_exists', data: {} });
    }
    return res.status(500).json({ success: false, message: 'Error', data: {} });
  }
}
