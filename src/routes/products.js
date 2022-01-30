const Knex = require('@/tools/Knex');

const productQueries = require('@/queries/products');
const imagableQueries = require('@/queries/imagables');

const { writeImage, removeImage } = require('@/tools/Imager');

const validateProductInput = (product, config = null) => {
  const errors = {};
  const { name, slug, description, price, image } = product;

  if (!name) {
    console.error('Error name')
    errors.name = 'name is required';
  }

  if (!slug) {
    console.error('Error slug')
    errors.slug = 'slug is required';
  }

  if (!description) {
    console.error('Error description')
    errors.description = 'description is required';
  }

  if (!price) {
    console.error('Error price')
    errors.price = 'price is required';
  }

  if (!config?.edit && !image) {
    console.error('Error image')
    errors.image = 'image is required';
  }

  return errors;
}

exports.validateProductInput = validateProductInput;

exports.index = async (req, res) => {
  try {
    productQueries.set();
    const products = await productQueries.get();
    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
}

exports.store = async (req, res) => {
  const errors = validateProductInput(req.body)

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const trx = await Knex.transaction();
  productQueries.set(trx);
  imagableQueries.set(trx);

  let image = null;

  try {
    const productCreatedId = await productQueries.create({ ...req.body });

    if (productCreatedId) {
      const product = await productQueries.get({ 'prod.id': productCreatedId }).first();

      // save image
      if (req.body.image) {
        image = await writeImage(req.body.image, `products`);

        await imagableQueries.create({
          imagable_id: productCreatedId,
          imagable_type: 'Product',
          image_path: image.path,
          image_name: image.name,
        });
      }

      await trx.commit();
      return res.status(200).json(product);
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

  const errors = validateProductInput(req.body, { edit: true })
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const trx = await Knex.transaction();
  productQueries.set(trx);
  imagableQueries.set(trx);

  try {
    const product = await productQueries.get({ 'prod.id': req.body.id }).first();

    // if user whant to change the product image
    if (req.body.image) {
      // if the product has already an image
      if (product.image_path) {
        await removeImage(product.image_path);
        await imagableQueries.delete({ imagable_id: req.body.id, imagable_type: 'Product' });
      }

      // create the new image save in disk and db
      const imageSaved = await writeImage(req.body.image, `products`);
      await imagableQueries.create({
        imagable_id: req.body.id,
        imagable_type: 'Product',
        image_path: imageSaved.path,
        image_name: imageSaved.name,
      });
    }

    // delete extra objects from the req.body
    delete req.body.image_path;
    delete req.body.image;

    const productUpdated = await productQueries.update({ id: req.params.id }, req.body);
    await trx.commit()
    return res.status(200).json(productUpdated);
  } catch (error) {
    console.error(error);
    await trx.rollback();
    return res.status(500).json(error);
  }

}

exports.delete = async (req, res) => {
  productQueries.set();
  imagableQueries.set();
  try {
    const product = await productQueries.get({ 'prod.id': req.params.id }).first();
    const productDeleted = await productQueries.delete({ id: product.id });
    if (productDeleted > 0) {
      removeImage(product.image_path);
      await imagableQueries.delete({ imagable_id: product.id, imagable_type: 'Product' });
      return res.json(productDeleted);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

exports.show = async (req, res) => {
  productQueries.set();
  console.log('SHOW', req.params.id);
  try {
    const product = await productQueries.get({ 'prod.id': req.params.id }).first();
    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
}