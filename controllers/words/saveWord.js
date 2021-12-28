const { validationResult } = require("express-validator");

exports.saveWord = async (req, res, next) => {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const error = new Error(validation.errors[0].msg);
    error.httpStatusCode = 401;
    error.data = validation.errors;
    return next(error);
  }

  const wordId = req.body.wordId;
  const filter = req.body.filter;

  const user = req.user;

  let selectedWord;
  user.cache.results.forEach((word) => {
    if (word.wordId === wordId) {
      selectedWord = word;
    }
  });

  if (!selectedWord) {
    const error = new Error("Selected word could not found!");
    error.httpStatusCode = 404;
    return next(error);
  }

  selectedWord.filters = [];

  if (filter) {
    if (!user.filters.includes(filter)) {
      const error = new Error("User has not this filter!");
      error.httpStatusCode = 404;
      return next(error);
    }

    selectedWord.filters.push(filter);

    // selectedWord.filter = filter;
  }

  let isWordExist;
  let updatedWord;

  // user.words.forEach((word) => {
  for (let word of user.words) {
    if (word.wordId === selectedWord.wordId) {
      if (filter) {
        if (word.filters.includes(filter)) {
          isWordExist = true;
          break;
        }

        word.filters.push(filter);
        word.history = new Date(Date.now());
        updatedWord = word;
        break;
      }
      isWordExist = true;
      break;

      // if (word.filter === selectedWord.filter) {
      //   isWordExist = true;
      // }
    }
  }
  // });

  if (isWordExist) {
    return res.status(401).json({ message: "This word has already saved!" });
  }

  if (updatedWord) {
    try {
      await user.save();
    } catch (err) {
      return next(err);
    }
    return res.status(201).json({ word: updatedWord });
  }

  selectedWord.history = new Date(Date.now());
  user.words.push(selectedWord);

  try {
    await user.save();
  } catch (err) {
    return next(err);
  }

  return res.status(201).json({ word: selectedWord });
};
