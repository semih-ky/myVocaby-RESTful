const https = require("https");
const { validationResult } = require("express-validator");
const path = require("path");
const { wordTypesAll } = require("../config/word.types");
const envConfig = require("dotenv").config(path.join(__dirname, "..", ".env"));
if (envConfig.error) {
  console.log("jwt.config: dotenv", envConfig.error);
}

const HOST = process.env.OX_API_HOST;
const APP_ID = process.env.OX_APP_ID;
const API_KEY = process.env.OX_API_KEY;

const FIELDS = "definitions%2Cexamples%2Cpronunciations";
const STRICT_MATCH = "false";
const LANGUAGE = "en-us";

exports.searchWord = async (req, res, next) => {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const error = new Error(validation.errors[0].msg);
    error.httpStatusCode = 401;
    error.data = validation.errors;
    return next(error);
  }

  try {
    const user = req.user;
    const word = req.body.word.toLowerCase();

    let choosenTypes = [];

    const types = req.body.types;

    if (Array.isArray(types)) {
      types.forEach((type) => {
        let typeLower = type.toLowerCase();

        if (wordTypesAll.includes(typeLower)) {
          choosenTypes.push(typeLower);
        }
      });
    }

    choosenTypes = choosenTypes.length > 0 ? choosenTypes : wordTypesAll;

    if (user.cache.word === word) {
      let extraWordType = [];
      let existWordTypes = [];

      choosenTypes.forEach((type) => {
        if (!user.cache.wordTypes.includes(type)) {
          extraWordType.push(type);
        } else {
          existWordTypes.push(type);
        }
      });

      if (extraWordType.length > 0) {
        console.log("inside extra types: line: 61");
        const options = getOptions(word, extraWordType.join("%2C"));
        return requestOxApi(options, (error, statusCode, result) => {
          if (statusCode === 200) {
            console.log("inside extra types: running: line: 65");

            user.cache.wordTypes = [...user.cache.wordTypes, ...extraWordType];
            user.cache.results = [...user.cache.results, ...result];
            user.save();

            if (existWordTypes.length === 0) {
              console.log("only extra type return: line: 72");

              return res.status(200).json({ results: result });
            }

            if (
              existWordTypes.length + extraWordType.length ===
              wordTypesAll.length
            ) {
              console.log("all user cache and extra type return: line: 81");

              return res
                .status(200)
                .json({ results: [...user.cache.results, ...result] });
            }

            console.log("filtered user cache and extra type return: line: 88");

            let filteredResults = user.cache.results.filter((result) =>
              existWordTypes.includes(result.wordType)
            );
            return res
              .status(200)
              .json({ results: [...filteredResults, ...result] });
          }

          if (statusCode === 404) {
            if (existWordTypes.length > 0) {
              console.log(
                "give error extra type and filtered user cache return: line: 101"
              );

              let filteredResults = user.cache.results.filter((result) =>
                existWordTypes.includes(result.wordType)
              );
              return res.status(200).json({ results: filteredResults });
            } else {
              return res
                .status(404)
                .json({ message: "No word matching in dictionary!" });
            }
          }

          if (error) {
            const err = new Error(error);
            err.httpStatusCode = statusCode;
            return next(err);
          }
        });
      }
      console.log("return only cache: line: 122");

      if (existWordTypes.length === user.cache.wordTypes.length) {
        console.log("all user cache return: line: 125");
        return res.status(200).json({ results: user.cache.results });
      }

      let filteredResults = user.cache.results.filter((result) =>
        choosenTypes.includes(result.wordType)
      );
      console.log("filtered user cache return: line: 132");

      if (filteredResults.length === 0) {
        console.log("No word match in user cacher!: line: 135");
        return res
          .status(404)
          .json({ message: "No word matching in dictionary!" });
      }

      return res.status(200).json({ results: filteredResults });
    }

    user.cache = null;

    const options = getOptions(word, choosenTypes.join("%2C"));
    console.log("normal search: line: 147");
    return requestOxApi(options, (error, statusCode, result) => {
      if (statusCode === 200) {
        console.log("normal search: running: line: 150");

        if (result.length === 0) {
          console.log(
            "normal search and the word has not any data!: line: 154"
          );
          return res
            .status(404)
            .json({ message: "This word has not any definition and example." });
        }

        user.cache.word = word;
        user.cache.wordTypes = choosenTypes;
        user.cache.results = result;
        user.save();

        return res.status(200).json({ results: result });
      }

      if (error) {
        const err = new Error(error);
        err.httpStatusCode = statusCode;
        return next(err);
      }
    });
  } catch (err) {
    next(err);
  }
};

function getOptions(word, lexicalCategory) {
  const path =
    "/api/v2/entries/" +
    LANGUAGE +
    "/" +
    word +
    "?fields=" +
    FIELDS +
    "&lexicalCategory=" +
    lexicalCategory;
  "&strictMatch=" + STRICT_MATCH;

  return {
    host: HOST,
    port: "443",
    path: path,
    headers: {
      app_id: APP_ID,
      app_key: API_KEY,
    },
  };
}

function requestOxApi(options, callback) {
  https.get(options, (resp) => {
    let body = "";

    resp.on("data", (data) => {
      if (resp.statusCode === 200) {
        body += data;
      }
    });

    resp.on("end", () => {
      if (resp.statusCode === 200) {
        let parsedData = parseData(JSON.parse(body));
        return callback(null, resp.statusCode, parsedData);
      }

      if (resp.statusCode === 404) {
        return callback(
          "No word matching in dictionary!",
          resp.statusCode,
          null
        );
      }

      return callback("Oxford API Response Error", resp.statusCode, null);
    });

    resp.on("error", (error) => {
      console.log("Problem with Oxford API request:///", error);
      callback("Problem with Oxford API request!", resp.statusCode, null);
    });
  });
}

function parseData(data) {
  let dataResults = [];

  data.results.forEach((result) => {
    result.lexicalEntries.forEach((lexicalEntry) => {
      let word = lexicalEntry.text;
      let wordType = lexicalEntry.lexicalCategory.id;

      if (!lexicalEntry.hasOwnProperty("entries")) return;

      lexicalEntry.entries.forEach((entry) => {
        let sound;
        if (entry.pronunciations) {
          entry.pronunciations.forEach((val) => {
            if (val.audioFile) sound = val.audioFile;
          });
        }

        if (!entry.hasOwnProperty("senses")) return;

        entry.senses.forEach((sense) => {
          let examples = sense.examples
            ? sense.examples.map((exp) => exp.text)
            : [];

          dataResults.push({
            wordId: sense.id,
            word: word,
            wordType: wordType,
            definitions: sense.definitions || [],
            examples: examples,
            sound: sound,
            subsense: false,
          });

          if (sense.subsenses) {
            sense.subsenses.forEach((subsense) => {
              let examples = subsense.examples
                ? subsense.examples.map((exp) => exp.text)
                : [];

              dataResults.push({
                wordId: subsense.id,
                word: word,
                wordType: wordType,
                definitions: subsense.definitions || [],
                examples: examples,
                sound: sound,
                subsense: true,
              });
            });
          }
        });
      });
    });
  });
  return dataResults;
}
