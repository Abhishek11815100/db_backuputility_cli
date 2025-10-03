#!/usr/bin/env node
import { Command } from 'commander';
import { backupDatabase } from '../lib/backup.js';
import { restoreDatabase } from '../lib/restore.js';

const program = new Command();

program
  .name("db_backuputility_cli")
  .description("CLI tool for backing up and restoring databases")
  .version("1.0.0");

program.command("backup")
  .description("Perform a database backup")
  .requiredOption("--dbtype <type>", "Database type: mysql | postgres | mongo | sqlite")
  .option("--host <host>", "Database host", "localhost")
  .option("--port <port>", "Database port")
  .option("--user <user>", "Database user")
  .option("--password <password>", "Database password")
  .option("--database <database>", "Database name")
  .option("--dbpath <dbpath>", "Path to SQLite DB file")
  .requiredOption("--output <output>", "Output file/directory for backup")
  .option("--compress", "Compress the backup file")
  .action(backupDatabase);

program.command("restore")
  .description("Restore database from backup")
  .requiredOption("--dbtype <type>", "Database type")
  .requiredOption("--input <input>", "Backup file to restore")
  .action(restoreDatabase);

program.parse(process.argv);
