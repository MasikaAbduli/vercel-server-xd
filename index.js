const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const instagramGetUrl = require("./ig")

const Tiktok = require("@tobyg74/tiktok-api-dl")
const { YTDL } = require("ytdl-easy");
var ytdl = require("ytdl-core");
const { yt5s } = require("@sl-code-lords/youtube-dl");
const { twitter } = require("imran-downloader-servar");

const app = express();
const port = 3300;

app.use(cors());
app.use(bodyParser.json());

app.get("/youtube-download", async (req, res) => {
  const inputValue = req.query.input;
  const youtubeURL = inputValue;

  YTDL(youtubeURL).then((data) => {
    console.log(data);
    res.json(data);
  });
});

app.get("/youtube-audio-download", async (req, res) => {
  const inputValue = req.query.input;
  const youtubeURL = inputValue;

  const info = await ytdl.getInfo(youtubeURL);

  // Filter out only the audio formats
  const audioFormats = info.formats.filter((format) =>
    format.mimeType.includes("audio")
  );

  var vid = await yt5s(youtubeURL);

  const data = {
    title: vid.result.title,
    image: vid.result.thumbnail,
    url: audioFormats,
  };
  console.log(data);
  res.json(data);
});

app.get("/instagram-downloader", async (req, res) => {
  const inputValue = req.query.input;
  const instagramURL = inputValue;

  instagramGetUrl(instagramURL)
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/instagram-image-downloader", async (req, res) => {
  const inputValue = req.query.input;
  const instagramURL = inputValue;

  const data = await instagramGetUrl(instagramURL);
  console.log(data);
  res.json(data);
});

app.get("/tiktok-downloader", async (req, res) => {
  const inputValue = req.query.input;
  const tiktokURL = inputValue;

  let versionsToTry = ["v3", "v2", "v1"]; // Versions to try in descending order of preference

  // Define a function to try downloading with a specific version
  function downloadWithVersion(version) {
    return Tiktok.Downloader(tiktokURL, { version: version });
  }

  // Function to handle the response or try the next version if an error occurs
  function handleResponse(data, version) {
    console.log(data);
    res.json(data);
  }

  // Function to handle errors and try the next version
  function handleError(error, versionIndex) {
    console.error(
      `Error downloading with version ${versionsToTry[versionIndex]}:`,
      error
    );
    // Try next version if available
    let nextVersionIndex = versionIndex + 1;
    if (nextVersionIndex < versionsToTry.length) {
      let nextVersion = versionsToTry[nextVersionIndex];
      console.log(`Trying with version ${nextVersion}`);
      downloadWithVersion(nextVersion)
        .then((data) => handleResponse(data, nextVersion))
        .catch((error) => handleError(error, nextVersionIndex));
    } else {
      // No more versions to try, return error response
      res.status(500).json({ error: "All versions failed to download" });
    }
  }

  // Start downloading with the default version v3
  downloadWithVersion("v3")
    .then((data) => handleResponse(data, "v3"))
    .catch((error) => handleError(error, 0));
});

app.get("/twitter-downloader", async (req, res) => {
  const inputValue = req.query.input;
  const twitterURL = inputValue;

  const data = await twitter(twitterURL);
  console.log(data);
  res.json(data);
});

/*app.get("/facebook-downloader", async (req, res) => {
  const inputValue = req.query.input;
  const facebookURL = inputValue;

  const data = await fbdown(facebookURL);
  console.log(data);
  res.json(data);
});*/

app.listen(port, () => {
  console.log(`Listening on Port : http://localhost:${port}`);
});
