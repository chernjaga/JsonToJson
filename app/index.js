const fs = require('fs');
const path = require('path');
const validator = require('./validator').validator;
const sourceJsonFolder = 'inputFiles';
const outputFolder = 'outputFiles';
const schemeFolder = 'schemes';
const jsonTestRegexp = /\.json$/;
const schemes = fs.readdirSync(schemeFolder).filter(filename => jsonTestRegexp.test(filename));

const redTextColor = '\u001b[31m';
const resetTextColor = '\x1b[0m';

const getDirectories = source =>
  fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
const directories = getDirectories(path.join(sourceJsonFolder));

directories.forEach(directory => {
  const dir = `${directory}`;
  console.log(dir)
  const inputFiles = fs.readdirSync(path.join(sourceJsonFolder, dir)).filter(filename => jsonTestRegexp.test(filename));
  schemes.forEach(scheme => {
    const schemeObj = require(path.join('..', schemeFolder, scheme));
    
    inputFiles.forEach(filename => {
      try {
        console.log(resetTextColor);
        const jsonAddress = path.join('..', sourceJsonFolder, dir, filename);
        const sourceJson = require(jsonAddress);
        console.log(`validator is started for ${jsonAddress} \n`);
        if (!fs.existsSync(path.join(outputFolder, dir))){
          fs.mkdirSync(path.join(outputFolder, dir), { recursive: true });
      }
        fs.writeFileSync(path.join(outputFolder, dir, `converted_${filename}`), JSON.stringify(validator(sourceJson, schemeObj), null, 2));
      } catch (error) {
        console.error(`${redTextColor}ERROR in ${dir}/${filename}: ${error.message}`);
      }
    })
  });
});


