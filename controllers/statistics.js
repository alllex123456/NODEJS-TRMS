exports.getStatistics = (req, res, next) => {
  req.user.populate('statistics').then((response) => {
    const currencies = ['RON', 'EUR', 'USD'];

    const dayFigures = currencies.map((currency) => {
      const dayCountsObject = response.statistics[`${currency}`].todayCount;
      const dayValuesOject = response.statistics[`${currency}`].todayValue;
      if (response.statistics.day?.getDate() !== new Date().getDate())
        return {
          currency,
          countCharacters: 0,
          countWords: 0,
          countPage: 0,
          countWord: 0,
          valueCharacters: 0,
          valueWords: 0,
          valuePage: 0,
          valueWord: 0,
        };
      return {
        currency,
        countCharacters: dayCountsObject.characters,
        countWords: dayCountsObject.words,
        countPage: dayCountsObject.page,
        countWord: dayCountsObject.word,
        valueCharacters: dayValuesOject.characters,
        valueWords: dayValuesOject.words,
        valuePage: dayValuesOject.page,
        valueWord: dayValuesOject.word,
      };
    });

    res.render('statistics/index', {
      page: 'Statistici',
      path: '/statistics',
      dayFigures,
    });
  });
};
