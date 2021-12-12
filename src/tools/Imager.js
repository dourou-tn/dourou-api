const fs = require('fs');
const path = require('path');

const { v4: uuidv4 } = require('uuid');

const writeImage = (base64, folder) => {
  const name = `${uuidv4()}.png`;
  const fullPath = path.join(process.env.STORAGE_FOLDER, 'images', folder, name);

  const base64Data = base64.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  fs.writeFileSync(fullPath, buffer);

  return { name, path: path.join('images', folder, name) };
}

const removeImage = async (imgPath) => {
  const fullPath = path.join(process.env.STORAGE_FOLDER, imgPath);
  fs.unlinkSync(fullPath);
}

module.exports = {
  writeImage,
  removeImage
}
