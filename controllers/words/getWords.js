exports.getWords = async (req, res, next) => {
  try {
    const filter = req.query.filter;
    const numberOfQuestions = req.query.numberOfQuestions;
    const user = req.user;
    let words;

    if (filter) {
      if (!user.filters.includes(filter)) {
        const error = new Error("This filter does not exist!");
        error.httpStatusCode = 404;
        throw error;
      }

      // words = user.words.filter((word) => word.filter === filter);
      words = user.words.filter((word) => word.filters.includes(filter));
    } else {
      words = user.words;
    }

    if (numberOfQuestions) {
      const numOfQstn = parseInt(numberOfQuestions);
      if (isNaN(numOfQstn)) {
        const error = new Error("Number of questions must be integer!");
        error.httpStatusCode = 401;
        throw error;
      }

      if (words.length < numOfQuestions) {
        const error = new Error("Not enough words to make quiz!");
        error.httpStatusCode = 401;
        throw error;
      }
    }

    return res.status(200).json({ words });
  } catch (err) {
    next(err);
  }
};
