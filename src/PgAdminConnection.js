import p from "puppeteer";
import { execSync } from "child_process";

export default class PgAdminConnection {
  dbName;
  userUsername;
  userPassword;
  dbUsername;
  dbPassword;
  ipAddress;

  browser;
  page;

  constructor(name, uUsername, uPassword, dUsername, dPassword) {
    this.dbName = name;
    this.userUsername = uUsername;
    this.userPassword = uPassword;
    this.dbUsername = dUsername;
    this.dbPassword = dPassword;
  }

  async signIn() {
    try {
      this.browser = await p.launch({
        ignoreDefaultArgs: ["--disable-extensions"],
      });
      this.page = await this.browser.newPage();
      await this.page.goto("http://localhost:5050/login?next=%2F");

      await this.page.type('input[name="email"]', this.userUsername);
      await this.page.type('input[name="password"]', this.userPassword);
      await this.page.keyboard.press("Enter");

      // TODO replace waitForTimeout with selector
      await this.page.waitForTimeout(10000);
      console.log("User logged in to PgAdmin");
    } catch (e) {
      console.error("Error navigating to sign in page ---", e);
    }
  }

  async addNewDBServer() {
    try {
      // Add DB new server
      await this.page.click('a[onclick="pgAdmin.Dashboard.add_new_server()"]');
      await this.page.waitForTimeout(5000);

      this.getIpAddress();

      // Input connection db name, IP Address, password, and username
      await this.page.type('input[name="name"]', this.dbName);
      await this.page.click('a[data-tab-index="2"]');
      await this.page.waitForTimeout(5000);

      await this.page.type('input[name="host"]', this.ipAddress);

      // Clear username input
      const input = await this.page.$('input[name="username"]');
      await input.click({ clickCount: 3 });
      await this.page.type('input[name="username"]', this.dbUsername);
      await this.page.type('input[name="password"]', this.dbPassword);

      await this.page.click('button[title="Save this object."]');
      console.log("DB server added");
    } catch (e) {
      console.error("Error adding DB server ---", e);
    }
  }

  async connectToDB() {
    try {
      await this.signIn();
      await this.addNewDBServer();

      await this.page.waitForTimeout(5000);

      await this.page.screenshot({ path: "result.png" });
      console.log("PgAdmin successfully connected to DBNAME");
      await this.browser.close();
    } catch (e) {
      console.log(e);
    }
  }

  getIpAddress() {
    const shellCommand = `docker inspect pg_container | grep '"IPAddress": "172*' | cut -d":" -f 2 | cut -d'"' -f 2`;

    this.ipAddress = execSync(shellCommand).toString();
  }
}
