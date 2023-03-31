function statistics(order) {
  let computedCharactersValue,
    computedWordsValue,
    computedWordValue,
    computedPagesValue;

  if (client.measurementUnit === 'words') {
    computedWordsValue = (+order.count * +order.rate) / 300;
  } else if (client.measurementUnit === 'characters') {
    computedCharactersValue = (+order.count * +order.rate) / 2000;
  } else if (client.measurementUnit === 'page') {
    computedPagesValue = +order.count * +order.rate;
  } else if (client.measurementUnit === 'word') {
    computedWordValue = +order.count * +order.rate;
  }
}
