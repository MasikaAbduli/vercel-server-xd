const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'https://xddown.pages.dev'
}));

// Function to sanitize filename
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_');
}

app.get('/download', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).send('URL parameter is missing');
    }
    try {
        const videoInfo = await ytdl.getInfo(url);
        if (!videoInfo || !videoInfo.formats || videoInfo.formats.length === 0) {
            console.error('Failed to get video information:', videoInfo);
            return res.status(500).send('Failed to get video information');
        }

        let selectedFormat = null;

        // Find a format that has both video and audio
        for (const format of videoInfo.formats) {
            if (format.hasVideo && format.hasAudio) {
                selectedFormat = format;
                break;
            }
        }

        if (!selectedFormat) {
            console.error('No format found with both video and audio');
            return res.status(500).send('No format found with both video and audio');
        }

        // Sanitize the video title to remove invalid characters
        const sanitizedTitle = sanitizeFilename(videoInfo.videoDetails.title);

        // Set response headers to trigger download
        res.header('Content-Disposition', `attachment; filename="${sanitizedTitle}.mp4"`);
        ytdl(url, { format: selectedFormat }).pipe(res);
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).send('Error downloading video');
    }
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
