const express = require('express');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 8080;

url = "https://www.willhaben.at/iad/gebrauchtwagen/auto/gebrauchtwagenboerse?fromYear=1990&price-to=15000&seller=PRIVATE"


app.get('/api/oglasi', async (req, res) => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Čekanje da se stranica prikaže (povećan timeout)
    await page.goto(url, { waitUntil: 'networkidle' });
	await page.waitForTimeout(3000); 
	
// Sačekaj prave selektore:
await page.waitForSelector('[data-testid^="search-result-entry"]', { timeout: 20000 });

const oglasi = await page.$$eval(
  '[data-testid^="search-result-entry"]',
  ads => ads.map(ad => {
    // h3 naslovi
    const naslov = ad.querySelector('h3')?.innerText.trim() || '';
    const cijena = ad.querySelector('span')?.innerText.trim() || '';
    const opis = ad.querySelector('p')?.innerText.trim() || '';
    const link = ad.querySelector('a')?.href || '';
	const slika = ad.querySelector('img')?.src || '';
    return { naslov, cijena, opis, link, slika };
  })
);


    await browser.close();
    res.json(oglasi);
  } catch (err) {
    console.error('❌ Greška u scrapanju:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server pokrenut na http://localhost:${PORT}`);
});
