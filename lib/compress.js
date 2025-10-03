import fs from "fs";
import zlib from "zlib";

export function gzipFile(filePath) {
  return new Promise((resolve, reject) => {
    const outputPath = `${filePath}.gz`;
    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(outputPath);
    const gzip = zlib.createGzip();

    input.pipe(gzip).pipe(output).on("finish", () => {
      fs.unlinkSync(filePath);
      resolve(outputPath);
    }).on("error", reject);
  });
}
