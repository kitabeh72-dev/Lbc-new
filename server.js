const express = require("express");
const path = require("path");
const puppeteer = require("puppeteer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Default route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Bot is running!" });
});

// Test Leboncoin login
app.post("/api/login-test", async (req, res) => {
  const email = process.env.LBC_EMAIL;
  const pass = process.env.LBC_PASSWORD;
  if (!email || !pass) {
    return res.status(400).json({ ok: false, error: "Missing LBC_EMAIL or LBC_PASSWORD env vars" });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();

    await page.goto("https://www.leboncoin.fr/", { waitUntil: "domcontentloaded" });
    // Accept cookies if present
    try {
      await page.waitForSelector("button", { timeout: 3000 });
      const buttons = await page.$$("button");
      for (const b of buttons) {
        const text = (await page.evaluate(el => el.innerText || "", b) || "").toLowerCase();
        if (/accepter|tout accepter|j'accepte/.test(text)) { await b.click(); break; }
      }
    } catch {}

    // Go to login page
    await page.goto("https://www.leboncoin.fr/compte/part/Login", { waitUntil: "domcontentloaded" });

    // Fill email/password
    const emailSel = "input[type='email'], input[name='email'], input[id*='email']";
    const passSel  = "input[type='password'], input[name='password'], input[id*='password']";
    await page.waitForSelector(emailSel, { timeout: 10000 });
    await page.type(emailSel, email, { delay: 30 });
    await page.type(passSel, pass, { delay: 30 });

    // Click login button
    const submit = await page.$x("//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'se connecter') or contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'connexion')]");
    if (submit[0]) { await submit[0].click(); }
    else { await page.keyboard.press("Enter"); }

    await page.waitForTimeout(4000);
    const loggedIn = await page.$("a[href*='/compte/'], [data-qa-id*='header-account']");
    await browser.close();

    return res.json({ ok: !!loggedIn, message: loggedIn ? "Login success" : "Login may have failed" });
  } catch (err) {
    if (browser) await browser.close();
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
