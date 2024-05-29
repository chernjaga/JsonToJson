const fs = require('fs');
const path = require('path');
const validator = require('./validator').validator;
const sourceJsonFolder = 'inputFiles';
const outputFolder = 'outputFiles';
const schemeFolder = 'schemes';
const jsonTestRegexp = /\.json$/;
const schemes = fs.readdirSync(schemeFolder).filter(filename => jsonTestRegexp.test(filename));
const getEnrichedContent = require('./contentFiller').getEnrichedContent;
const redTextColor = '\u001b[31m';
const yellowTextColor = '\033[33m';
const greenTextColor = '\033[32m';
const resetTextColor = '\x1b[0m';

const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
const directories = getDirectories(path.join(sourceJsonFolder));
const errorSummary = {
  fileList: {},
  totalErrorsCount: 0
};
console.time('Time summary');

directories.forEach(directory => {
  const dir = `${directory}`;
  errorSummary.fileList[dir] = [];
  const inputFiles = fs.readdirSync(path.join(sourceJsonFolder, dir)).filter(filename => jsonTestRegexp.test(filename));
  schemes.forEach(scheme => {
    const schemeObj = require(path.join('..', schemeFolder, scheme));
    inputFiles.forEach(filename => {
      try {
        console.log(resetTextColor);
        const jsonAddress = path.join('..', sourceJsonFolder, dir, filename);
        const sourceJson = require(jsonAddress);
        // console.log(`validator is started for ${jsonAddress} \n`);
        if (!fs.existsSync(path.join(outputFolder, dir))){
          fs.mkdirSync(path.join(outputFolder, dir), { recursive: true });
      }
        fs.writeFileSync(path.join(outputFolder, dir, `converted_${filename}`), JSON.stringify(
          // getEnrichedContent(validator(sourceJson, schemeObj, true), sourceJson), null, 2)
          getEnrichedContent(sourceJson), null, 2)
        );
      } catch (error) {
        errorSummary.fileList[dir].push(`${filename}`);
        errorSummary.totalErrorsCount++;
        console.log(`${redTextColor}ERROR in ${dir}/${filename}: ${error.message}`);
      }
    })
  });
});

if (errorSummary.totalErrorsCount) {
  for (const directory in errorSummary.fileList ) {
    console.log(`${yellowTextColor}\nErrors file list for ${directory} folder: \n  ${errorSummary.fileList[directory].join(', ')}`);
  };
  console.log(`\nTotal errors count: ${errorSummary.totalErrorsCount}\n`);
}
console.log(greenTextColor);
console.timeEnd('Time summary');
