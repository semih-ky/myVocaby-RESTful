const { validationResult } = require("express-validator");

exports.deleteWord = async (req, res, next) => {
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

  // let wordToDelete = user.words.id(wordDBId);
  // if (!wordToDelete) {
  //   const err = new Error("Word could not found!");
  //   err.httpStatusCode = 404;
  //   return next(err);
  // }

  let wordToDeleteIndex = user.words.findIndex(
    (word) => word.wordId === wordId
  );
  if (wordToDeleteIndex === -1) {
    const err = new Error("Word could not found!");
    err.httpStatusCode = 404;
    return next(err);
  }

  if (filter) {
    if (!user.filters.includes(filter)) {
      const error = new Error("User has not this filter!");
      error.httpStatusCode = 404;
      return next(error);
    }
    // wordToDelete.filters = wordToDelete.filters.filter((val) => val !== filter);
    user.words[wordToDeleteIndex].filters.filter((val) => val !== filter);

    try {
      await user.save();
    } catch (err) {
      return next(err);
    }

    return res.status(200).json({ message: "Successful!" });
  }

  // wordToDelete.remove();

  // let updatedWordList = user.words.filter(item => item.wordId !== wordId);
  // user.words = updatedWordList;
  user.words.splice(wordToDeleteIndex, 1);

  try {
    await user.save();
  } catch (err) {
    return next(err);
  }

  return res.status(200).json({ message: "Successful!" });
};
