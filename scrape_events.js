const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const { parse, isWithinInterval } = require('date-fns');

const URL = 'https://www.du.edu/calendar';
const START_DATE = new Date('2025-01-01');
const END_DATE = new Date('2025-12-31');

async function scrapeCalendarEvents() {
    try {
        // Fetch the HTML content
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);

        let events = [];

        // Select all event blocks
        $('.event').each((index, element) => {
            // Extract event title
            let title = $(element).find('.event-title').text().trim();

            // Extract event date and time
            let dateText = $(element).find('.event-date').text().trim();
            let timeText = $(element).find('.event-time').text().trim();

            // Parse date and time
            let date = parse(dateText, 'MMMM d, yyyy', new Date());
            let time = timeText || null;

            // Extract event description
            let description = $(element).find('.event-description').text().trim() || null;

            // Filter events within the year 2025
            if (isWithinInterval(date, { start: START_DATE, end: END_DATE })) {
                events.push({
                    title,
                    date: dateText,
                    time,
                    description
                });
            }
        });

        // Save to JSON
        const outputFilePath = 'results/events.json';
        await fs.outputJson(outputFilePath, { events }, { spaces: 4 });

        console.log(`✅ Successfully scraped ${events.length} events for the year 2025!`);
        console.log(`📁 Data saved in ${outputFilePath}`);
    } catch (error) {
        console.error("❌ Error scraping calendar events:", error);
    }
}

// Run the scraper
scrapeCalendarEvents();