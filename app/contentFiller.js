const contentMap = require('./dataSourceMap.json');
const _ = require('lodash');
const sample = require('../BS_sample_JSON.json');
const originalScheme = require('../schemes/new schema may.json')

function getEnrichedContent(oldData) {
  for (const oldContentKey in contentMap) {
    const dataValue = _.get(oldData, oldContentKey);
    _.set(sample, contentMap[oldContentKey], dataValue);
  }
  return validateSample(sample, originalScheme);
}

function validateSample(data, scheme) {
  if (scheme?.type === 'object') {
    _.forIn(scheme.properties, (prop, key) => {
       if (prop?.type === 'string') {
        data[key] = data[key] || null
        if (data[key] === 'boolean') data[key] = false;
       };
       if (prop?.type === 'boolean') data[key] = data[key] || false;
       if (prop?.type === 'object') data[key] = validateSample(data[key], prop);
       if (prop?.type === 'array') data[key][0] = validateSample(data[key][0], prop.items[0]);
    })
  }
  return data
}

module.exports = {
  getEnrichedContent
};
