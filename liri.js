require("dotenv").config();
const keys = require("./keys.js");
const axios = require("axios");
const moment = require("moment");
const fs = require("fs");
const Spotify = require("node-spotify-api");
const inquirer = require("inquirer");

var spotify = new Spotify(keys.spotify);

const defaultSpotifySong = "The Sign";
const defaultBand = "Imagine Dragons";
const defaultMovie = "The Godfather";
var command = " ";
var input = " ";

var firstQuestion = [
  {
    type: "list",
    choices: [
      { name: "Search a Movie", value: "movie-this" },
      { name: "Search a Band", value: "concert-this" },
      { name: "Search a Song", value: "spotify-this-song" },
      { name: "Do What the file says", value: "do-what-it-says" }
    ],
    message: "LIRI at your service, what can I do for you master?",
    name: "userCommand"
  }
];

var secondQuestion = [
  {
    type: "input",
    message: "Please enter your search term...",
    name: "searchTerm"
  }
];

function handleCommand(command) {
  switch (command) {
    case "spotify-this-song":
      input = input.trim().length == 0 ? defaultSpotifySong : input;
      searchSpotify(input);
      break;

    case "concert-this":
      input = input.trim().length == 0 ? defaultBand : input;
      searchBandsInTown(input);
      break;

    case "movie-this":
      input = input.trim().length == 0 ? defaultMovie : input;
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
    if (response) {
      if (response.status == 200) {
        maxConcerts = response.data.length > 5 ? 5 : response.data.length;
        if (maxConcerts == 0) {
          console.log(`No concerts found`);
          return;
        }
        console.log("-------------------------------------------------------");
        console.log(`Upcoming concerts for ${input} are: `);
        for (var i = 0; i < maxConcerts; i++) {
          console.log(
            `${response.data[i].venue.name} , ${
              response.data[i].venue.city
            } , ${response.data[i].venue.country} on ${moment(
              response.data[i].datetime
            ).format("MM/DD/YYYY")}`
          );
        }
        console.log("-------------------------------------------------------");
      } else {
        console.log(`Something went wrong, status: ${response.status}`);
      }
    }
  });
}

function searchMovie(input) {
  let movieName = input.split(" ").join("+");
  let queryUrl =
    "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";
  axiosCall(queryUrl).then(function(response) {
    if (response.status == 200) {
      if (response.data.hasOwnProperty("Error")) {
        console.log(response.data.Error);
      } else {
        let rottenTomatoesRatingIndex = response.data.Ratings.map(
          e => e.Source
        ).indexOf("Rotten Tomatoes");
        if (rottenTomatoesRatingIndex == -1) {
          var rottenTomatoesRating = "Unavailable";
        } else {
          var rottenTomatoesRating =
            response.data.Ratings[rottenTomatoesRatingIndex].Value;
        }

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
      }
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
    .then(response => {
      if (response) {
        return response;
      } else {
        return;
      }
    })
    .catch(function(error) {
      if (error.response) {
        console.log(error.response.statusText);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log("Error", error.message);
      }
      // console.log(error.config);
      return;
    });
}

function askQuestion() {
  inquirer.prompt(firstQuestion).then(inquirerResponse => {
    command = inquirerResponse.userCommand;
    if (command != "do-what-it-says") {
      inquirer.prompt(secondQuestion).then(inquirerResponse2 => {
        input = inquirerResponse2.searchTerm;
        if (input.trim().length == 0 && command != "do-what-it-says") {
          console.log("Don't mess with LIRI, I will choose what to show you");
        }
        handleCommand(command);
      });
    } else {
      handleCommand(command);
    }
  });
}

askQuestion();
