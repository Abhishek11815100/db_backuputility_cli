import { exec } from "child_process";
import fs from "fs";
import logger from "./logger.js";

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        logger.error(`Restore failed: ${stderr}`);
        return reject(err);
      }
      resolve(stdout);
    });
  });
}

export async function restoreDatabase(options) {
  const { dbtype, input } = options;
  try {
    if (dbtype === "mysql") {
      const cmd = `mysql < ${input}`;
      await runCommand(cmd);
    } else if (dbtype === "postgres") {
      const cmd = `pg_restore -d ${process.env.PGDATABASE} ${input}`;
      await runCommand(cmd);
    } else if (dbtype === "mongo") {
      const cmd = `mongorestore ${input}`;
      await runCommand(cmd);
    } else if (dbtype === "sqlite") {
      fs.copyFileSync(input, process.env.DBPATH || "./restored.sqlite");
    } else {
      throw new Error("Unsupported DB type");
    }

    logger.info(`Restore successful from ${input}`);
    console.log(`✅ Restore completed from ${input}`);

  } catch (err) {
    logger.error(err.message);
    console.error(`❌ Error: ${err.message}`);
  }
}
