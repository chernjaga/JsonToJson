const fs = require('fs');
const path = require('path');
const validator = require('./validator').validator;
const sourceJsonFolder = 'inputFiles';
const outputFolder = 'outputFiles';
const schemeFolder = 'schemes';
const jsonTestRegexp = /\.json$/;
const inputFiles = fs.readdirSync(sourceJsonFolder).filter(filename => jsonTestRegexp.test(filename));
const schemes = fs.readdirSync(schemeFolder).filter(filename => jsonTestRegexp.test(filename));

const redTextColor = '\u001b[31m';
const resetTextColor = '\x1b[0m';

schemes.forEach(scheme => {
  const schemeObj = require(path.join('..', schemeFolder, scheme));
  
  inputFiles.forEach(filename => {
    try {
      console.log(resetTextColor);
      const jsonAddress = path.join('..', sourceJsonFolder, filename);
      const sourceJson = require(jsonAddress);
      console.log(`validator is started for ${jsonAddress} \n`);
      fs.writeFileSync(path.join(outputFolder, `converted_${filename}`), JSON.stringify(validator(sourceJson, schemeObj), null, 2));
    } catch (error) {
      console.error(`${redTextColor}ERROR in ${filename}: ${error.message}`);
    }
  })
});

