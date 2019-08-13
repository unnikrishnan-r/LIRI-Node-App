require("dotenv").config();
const keys = require("./keys.js");
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");
const Spotify = require("node-spotify-api");

var spotify = new Spotify(keys.spotify);

const defaultSpotifySong = "The Sign";
var command = process.argv[2];
var input = process.argv[3];

handleCommand(command);

function handleCommand(command) {
  console.log(command, input);
  switch (command) {
    case "spotify-this-song":
      searchSpotify(input);
      break;

    case "concert-this":
      searchBandsInTown(input);
      break;

    case "movie-this":
      searchMovie(input);
      break;

    case "do-what-it-says":
      readCommandFromFile();
      break;

    default:
      console.log("Invalid command, try again");
      break;
  }
}

function searchSpotify(input) {
  if (!input) {
    input = defaultSpotifySong;
  }

  let artistName = [];
  spotify
    .search({
      type: "track",
      query: input
    })
    .then(function(data) {
      if (data.tracks.items.length > 0) {
        data.tracks.items[0].artists.forEach(artist => {
          artistName.push(artist.name);
        });
        console.log("-------------------------------------------------------");
        console.log(`**Artists: ${artistName.join(",")}`);
        console.log(`**Song : ${data.tracks.items[0].name}`);
        console.log(`**Preview: ${data.tracks.items[0].preview_url}`);
        console.log(`**Album : ${data.tracks.items[0].album.name}`);
        console.log("-------------------------------------------------------");
      } else {
        console.log("No results returned");
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

function searchBandsInTown(input) {
  let queryUrl =
    "https://rest.bandsintown.com/artists/" +
    input +
    "/events?app_id=codingbootcamp";
  axiosCall(queryUrl).then(function(response) {
    if (response.status == 200) {
      if (response.data.length > 5) {
        maxConcerts = 5;
      } else {
        maxConcerts = response.data.length;
      }

      if (maxConcerts == 0) {
        console.log(`No concerts found`);
      }

      console.log("-------------------------------------------------------");
      for (var i = 0; i < maxConcerts; i++) {
        console.log(
          `${response.data[i].venue.name} , ${response.data[i].venue.city} , ${
            response.data[i].venue.country
          } on ${moment(response.data[i].datetime).format("MM/DD/YYYY")}`
        );
      }
      console.log("-------------------------------------------------------");
    } else {
      console.log(`Something went wrong, status: ${response.status}`);
    }
  });
}

function searchMovie(input) {
  let movieName = input.split(" ").join("+");
  let queryUrl =
    "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
  axiosCall(queryUrl).then(function(response) {
    if (response.status == 200) {
      let rottenTomatoesRatingIndex = response.data.Ratings.map(
        e => e.Source
      ).indexOf("Rotten Tomatoes");
      let rottenTomatoesRating =
        response.data.Ratings[rottenTomatoesRatingIndex].Value;

      console.log("-------------------------------------------------------");
      console.log(`**Title: ${response.data.Title}`);
      console.log(`**Year: ${response.data.Year}`);
      console.log(`**IMDB Rating : ${response.data.imdbRating}`);
      console.log(`**RT Rating : ${rottenTomatoesRating}`);
      console.log(`**Country : ${response.data.Country}`);
      console.log(`**Language : ${response.data.Language}`);
      console.log(`**Plot : ${response.data.Plot}`);
      console.log(`**Actors : ${response.data.Actors}`);
      console.log("-------------------------------------------------------");
    } else {
      console.log(`Something went wrong, status: ${response.status}`);
    }
  });
}

function readCommandFromFile() {
  fs.readFile("./random.txt", "utf8", function(error, data) {
    if (error) {
      console.error(err);
    }
    let fileText = data.split(",");
    command = fileText[0];
    input = fileText[1];
    handleCommand(command);
  });
}
function axiosCall(queryUrl) {
  return axios
    .get(queryUrl)
    .then(response => response)
    .catch(function(error) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log("Error", error.message);
      }
      console.log(error.config);
    });
}
