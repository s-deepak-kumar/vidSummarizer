const dotenv = require("dotenv");
const assert = require("assert");

dotenv.config();

// Getting .env constants value
const {
    PORT,
    HOST,
    HOST_URL,
    ASSEMBLYAI_API_KEY,
    COHERE_API_KEY,
    RAPID_API_KEY,
    RAPID_API_YOUTUBE_MP3_HOST,
    RAPID_API_YOUTUBE_MP3_URL
} = process.env;

// adding init assertions
assert(PORT, "Application port is required");
assert(HOST_URL, "Service endpoint is required");
assert(ASSEMBLYAI_API_KEY, "AssemblyAI API key is required");
assert(COHERE_API_KEY, "Co:here API key is required");
assert(RAPID_API_KEY, "Rapid API key is required");
assert(RAPID_API_YOUTUBE_MP3_HOST, "RapidAPI Youtube Mp3 host is required");
assert(RAPID_API_YOUTUBE_MP3_URL, "RapidAPI Youtube Mp3 url is required");

// Exporting constants
module.exports = {
    port: PORT,
    host: HOST,
    url: HOST_URL,
    assemblyAIConfig: {
        apiKey: ASSEMBLYAI_API_KEY
    },
    cohereConfig: {
        apiKey: COHERE_API_KEY
    },
    rapidYoutubeMp3Config: {
        apiKey: RAPID_API_KEY,
        host: RAPID_API_YOUTUBE_MP3_HOST,
        url: RAPID_API_YOUTUBE_MP3_URL
    }
};