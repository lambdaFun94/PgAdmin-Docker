import PgAdminConnection from "./PgAdminConnection.js";

const USER_USERNAME = "admin@admin.com";
const USER_PASSWORD = "root";

const DB_NAME = "TestDatabase";
const DB_USERNAME = "root";
const DB_PASSWORD = "root";

const pgInstance = new PgAdminConnection(
  DB_NAME,
  USER_USERNAME,
  USER_PASSWORD,
  DB_USERNAME,
  DB_PASSWORD
);

pgInstance.connectToDB();
