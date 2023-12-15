import fs from "fs";

class StorageServices {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, filename) {
    const fileName = +new Date() + filename;
    const path = `${this._folder}/${fileName}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on("error", (error) => reject(error));

      file.pipe(fileStream);

      file.on("end", () => resolve(fileName));
    });
  }
}

export default StorageServices;
