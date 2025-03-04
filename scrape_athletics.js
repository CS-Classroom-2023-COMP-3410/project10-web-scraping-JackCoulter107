const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const BASE_URL = 'https://denverpioneers.com/schedule.aspx?path=';
const SPORTS_PATHS = [
    "mbball", "wbball", "mgolf", "wgolf", "gymnastics", "mhockey", 
    "mlax", "wlax", "skiing", "msoc", "wsoc", "mswim", "wswim", 
    "mten", "wten", "wtri", "wvball"
];

async function scrapeAthleticSchedules() {
    let allEvents = [];

    for (let sport of SPORTS_PATHS) {
        let url = `${BASE_URL}${sport}`;
        console.log(`🔍 Scraping: ${url}`);

        try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);

            $('.sidearm-schedule-game').each((index, element) => {
                let date = $(element).find('.sidearm-schedule-game-opponent-date').text().trim();
                let opponent = $(element).find('.sidearm-schedule-game-opponent-text').text().trim();
                let location = $(element).find('.sidearm-schedule-game-location').text().trim();
                let time = $(element).find('.sidearm-schedule-game-time').text().trim() || 'TBD';

                if (date && opponent) {
                    allEvents.push({
                        sport,
                        date,
                        opponent,
                        location,
                        time
                    });
                }
            });
        } catch (error) {
            console.error(`❌ Failed to scrape ${sport}:`, error.message);
        }
    }

    const outputFilePath = 'results/athletics.json';
    await fs.outputJson(outputFilePath, { events: allEvents }, { spaces: 4 });

    console.log(`✅ Scraped ${allEvents.length} games across 17 DU teams!`);
    console.log(`📁 Data saved in ${outputFilePath}`);
}

// Run the scraper
scrapeAthleticSchedules();
