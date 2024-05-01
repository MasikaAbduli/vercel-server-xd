const axios = require("axios");
const cheerio = require('cheerio');

module.exports = instagramGetUrl = (url) => {
    return new Promise(async (resolve) => {
        try {
            let json = await (await axios.post("https://saveig.app/api/ajaxSearch", require('querystring').stringify({ q: url, t: "media", lang: "en" }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Origin': 'https://saveig.app/en',
                    'Referer': 'https://saveig.app/en',
                    'Referrer-Policy': 'strict-origin-when-cross-origin',
                    'User-Agent': 'PostmanRuntime/7.31.1'
                }
            })).data;

            let $ = cheerio.load(json.data);
            let data = [];

            $('div.download-items__btn').each((i, e) => {
                let type = $(e).find('a').attr('href').match('.jpg') ? 'image' : 'video';
                let url = $(e).find('a').attr('href');
                let thumbnail = type === 'image' ? $(e).prev().find('img').attr('src') : $(e).prev().find('video').attr('poster');
                if (!thumbnail) thumbnail = ''; // set thumbnail to empty string if it's undefined
                data.push({ type, url, thumbnail });
            });

            if (!data.length) return resolve({ status: false });

            resolve({ status: true, data });
        } catch (e) {
            console.log(e);
            return resolve({ status: false, msg: e.message });
        }
    });
};
