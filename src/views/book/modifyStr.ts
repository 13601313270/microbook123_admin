const en = /^[A-Za-z]$/
const imgMatch = /^!\[.*\]\((.*)\)/

export default function (str: string): Array<{
  word: string;
  style: any[]
}> {
  const wordList = []
  let word = '';
  let splitIndex = 0;
  const style = [];
  while (splitIndex < str.length) {
    // 查看结束符
    const lastStyle = style[style.length - 1];
    if (['#', '##', '###'].includes(lastStyle)) {
      if (str.slice(splitIndex).indexOf('\n') === 0) {
        style.pop()
      }
    }
    if (lastStyle === '**') {
      if (str.slice(splitIndex).indexOf('**') === 0) {
        style.pop()
        splitIndex += 2;
        continue;
      }
    }
    // 拼装数字
    if (str.slice(splitIndex).match(/^(#+)\s?/)) {
      const match = str.slice(splitIndex).match(/^(#+)\s?/) as RegExpMatchArray;
      style.push(match[1])
      splitIndex += match[0].length
      continue;
    }
    else if (str.slice(splitIndex).match(/^(\*\*+)\s?/)) {
      const match = str.slice(splitIndex).match(/^(\*\*+)\s?/) as RegExpMatchArray;
      style.push(match[1])
      splitIndex += match[0].length
      continue;
    }
    else if (str.slice(splitIndex).match(imgMatch)) {
      const match = str.slice(splitIndex).match(imgMatch) as RegExpMatchArray;
      style.push('img')
      splitIndex += match[0].length
      word = match[1];
      wordList.push({
        word,
        style: JSON.parse(JSON.stringify(style)),
      });
      word = '';
      continue;
    }
    else if (str.slice(splitIndex).match(/^-{6,}/)) {
      const match = str.slice(splitIndex).match(/^-{6,}/) as RegExpMatchArray;
      style.push('split')
      splitIndex += match[0].length
      word = match[1];
      wordList.push({
        word,
        style: JSON.parse(JSON.stringify(style)),
      });
      word = '';
      continue;
    }
    else if (str.slice(splitIndex).match(/^={6,}/)) {
      const match = str.slice(splitIndex).match(/^={6,}/) as RegExpMatchArray;
      style.push('split')
      splitIndex += match[0].length
      word = match[1];
      wordList.push({
        word,
        style: JSON.parse(JSON.stringify(style)),
      });
      word = '';
      continue;
    }
    else if (en.test(str[splitIndex])) {
      word += str[splitIndex];
      if (en.test(str[splitIndex + 1])) {
        splitIndex++
        continue;
      }
    } else if (word.length === 0) {
      word = str[splitIndex];
    }
    wordList.push({
      word,
      style: JSON.parse(JSON.stringify(style)),
    });
    splitIndex++
    word = '';
  }
  return wordList;
  // const matchMarkown = str.match(/#+\s?(.*)/);

  // if (matchMarkown) {
  //   doc.setFont('sansBolds')
  //   doc.setTextColor('#000')
  //   return matchMarkown[1];
  // } else {
  //   doc.setFont('sans')
  //   doc.setTextColor('#333')
  //   return str;
  // }
}