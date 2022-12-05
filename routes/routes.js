const express = require("express");
const config = require("../config");
const getAbsolutePath = require('../utils')
const examples = require('../constants')
const path = require("path");
const axios = require("axios");
const fs = require("fs");
var multer = require('multer');
const download = require('download');

const cohere = require('cohere-ai');
cohere.init(config.cohereConfig.apiKey);

const router = express.Router();

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './assets/uploads');
    },
    filename: function(req, file, callback) {
        uniqueFileName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        type = file.originalname.split('.').pop();
        callback(null, uniqueFileName + "." + type);
    }
});

var upload = multer({ storage: storage }).single('file');

var uniqueFileName = "";
var type = "";

// Method for saving file into folder ('/assets/uploads/')
router.post("/upload", async(req, res) => {
    await upload(req, res, async function(err) {
        // check for error
        if (err || req.file === undefined) {
            console.log(err)
            res.send("Error occured!")
        } else {
            res.send({ status: 200, message: "File Uploaded!", type: type, id: uniqueFileName })
        }
    });
});

// Method for extracting MP3 from YouTube video & save into folder ('/assets/uploads/')
router.post("/upload_yt", async(req, res) => {
    const options = {
        method: 'GET',
        url: config.rapidYoutubeMp3Config.url,
        params: { id: req.body.video_id },
        headers: {
            'X-RapidAPI-Key': config.rapidYoutubeMp3Config.apiKey,
            'X-RapidAPI-Host': config.rapidYoutubeMp3Config.host
        }
    };

    axios.request(options).then(function(response) {
        // Path at which image will get downloaded
        const filePath = getAbsolutePath() + "/assets/uploads";

        var uniqueFileId = Date.now() + '-' + Math.round(Math.random() * 1E9);

        download(response.data.link, filePath, { filename: `${uniqueFileId}.mp3` })
            .then(() => {
                console.log('Download Completed');
                res.send({ status: 200, message: "File Uploaded!", type: "mp3", id: uniqueFileId })
            })
    }).catch(function(error) {
        res.send({ status: 400, error: error })
    });
});

// Method for upoloading file to AssemblyAI
router.post("/upload_file", async(req, res) => {
    const assembly = axios.create({
        baseURL: "https://api.assemblyai.com/v2",
        headers: {
            authorization: config.assemblyAIConfig.apiKey,
            "content-type": "application/json",
            "transfer-encoding": "chunked",
        },
    });
    const file = getAbsolutePath() + "/assets/uploads/" + req.body.id + "." + req.body.type;
    fs.readFile(file, (err, data) => {
        if (err) return console.error(err);

        assembly
            .post("/upload", data)
            .then(async(resp) => {
                res.send({ status: 200, message: "File Uploaded!", upload_url: resp.data.upload_url })
            })
            .catch((err) => console.error(err));
    });
});

// Method for summarizing, Sentiment Analysing using Co:here
router.post("/summarize", async(req, res) => {
    const assembly = axios.create({
        baseURL: "https://api.assemblyai.com/v2",
        headers: {
            authorization: config.assemblyAIConfig.apiKey,
            "content-type": "application/json",
            "transfer-encoding": "chunked",
        },
    });

    const response = await assembly.post("/transcript", {
        audio_url: req.body.upload_url,
    })

    // Interval for checking transcript completion
    const checkCompletionInterval = setInterval(async() => {
        const transcript = await assembly.get(`/transcript/${response.data.id}`)
        const transcriptStatus = transcript.data.status

        if (transcriptStatus !== "completed") {
            console.log(`Transcript Status: ${transcriptStatus}`)
        } else if (transcriptStatus === "completed") {
            let transcriptText = transcript.data.text
            clearInterval(checkCompletionInterval)

            const response = await cohere.generate({
                model: 'xlarge',
                prompt: transcriptText,
                max_tokens: 70,
                temperature: 0.8,
                k: 0,
                p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
                stop_sequences: ["--"],
                return_likelihoods: 'NONE'
            });

            const sentimentResponse = await cohere.classify({ inputs: (transcriptText.split(".")).filter(e => e), examples: examples });

            let countPossitive = 0,
                countNegative = 0;
            sentimentResponse.body.classifications.forEach(classification => {
                if (classification.prediction == "positive") {
                    countPossitive++;
                } else {
                    countNegative++;
                }
            });

            console.log(`Positive: ${countPossitive}\nNegative: ${countNegative}`)

            let finalVerdict = "";
            if (countPossitive > countNegative) {
                finalVerdict = "POSITIVE";
            } else if (countPossitive < countNegative) {
                finalVerdict = "NEGATIVE";
            } else {
                finalVerdict = "NEUTRAL";
            }

            res.send({ status: 200, transcript: transcriptText, sentiment: finalVerdict, summary: response.body.generations[0].text })
        }
    }, 3000)
});

// GET method for homepage
router.get("/", (req, res) => {
    res.render(getAbsolutePath() + '/views/index.html', { user: "Hello" });
});

//GET method for upload page
router.get("/upload-file", (req, res) => {
    res.render(getAbsolutePath() + '/views/upload-file.html');
});

// GET method for showing progress & results of summarize page
router.get("/summarize/:mimeType/:type/:id", (req, res) => {
    res.render(getAbsolutePath() + '/views/summarize.html', { mimeType: req.params.mimeType, type: req.params.type, id: req.params.id });
});

// Exporting Routes
module.exports = {
    routes: router
};