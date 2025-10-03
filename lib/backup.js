import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { gzipFile } from "./compress.js";
import logger from "./logger.js";

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        logger.error(`Command failed: ${stderr}`);
        return reject(err);
      }
      resolve(stdout);
    });
  });
}

export async function backupDatabase(options) {
  const { dbtype, host, port, user, password, database, dbpath, output, compress } = options;
  const start = Date.now();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupdir = path.join(output, `${database}_${timestamp}`);
  fs.mkdirSync(backupdir, { recursive: true });
  
  try {
    if (dbtype === "mysql") {
      const cmd = `mysqldump -h ${host} -P ${port || 3306} -u ${user} -p${password} ${database} > ${output}`;
      await runCommand(cmd);
    } else if (dbtype === "postgres") {
      const cmd = `PGPASSWORD=${password} pg_dump -h ${host} -p ${port || 5432} -U ${user} -F c ${database} > ${output}`;
      await runCommand(cmd);
    } else if (dbtype === "mongo") {
      const cmd = `mongodump --host ${host} --port ${port || 27017} --db ${database} --out ${backupdir}`;
      await runCommand(cmd);
    } else if (dbtype === "sqlite") {
      fs.copyFileSync(dbpath, output);
    } else {
      throw new Error("Unsupported DB type");
    }

    let finalOutput = backupdir;
    if (compress) {
      finalOutput = await gzipFile(backupdir);
    }

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    logger.info(`Backup completed: ${finalOutput} (Time taken: ${duration}s)`);
    console.log(`✅ Backup successful → ${finalOutput}`);

  } catch (err) {
    logger.error(`Backup failed: ${err.message}`);
    console.error(`❌ Error: ${err.message}`);
  }
}
