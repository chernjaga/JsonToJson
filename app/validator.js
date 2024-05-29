const renameMap = require('./renameMap.json');

const getOldKeyValue = (mapObject, value) => {
  return Object.keys(mapObject).find(key => mapObject[key] === value);
}

function validator(sourceJson, scheme, strictByScheme) {
  const outputObject = {};
  if (!scheme) {
    return sourceJson || null;
  };
  for (const property in sourceJson) {
    const renamedKey = renameMap[property];
    if (scheme.required && scheme.required.includes(renamedKey || property)) {
        if (scheme.properties[renamedKey || property].type === 'string') {
          outputObject[renamedKey || property] = sourceJson[property] || setDefaultValueByType('string');
        } else {
          outputObject[renamedKey || property] = assignSpecificObject(sourceJson[property], scheme.properties[renamedKey || property], strictByScheme);
        }
    } else if (!strictByScheme) {
      outputObject[renamedKey || property] = sourceJson[property];
    }
  }
  if (scheme.required) {
    for (const requiredField of scheme.required) {
      const renamedRequiredKey = getOldKeyValue(renameMap, requiredField);
      
      if (!sourceJson[renamedRequiredKey]) {
        outputObject[requiredField] = setDefaultValueByType(scheme.properties[requiredField].type, scheme.properties[requiredField].required, scheme.properties[requiredField]);
      }
    }
  }
  return outputObject;
};

function assignSpecificObject (src, scheme, strictByScheme) {
  if (scheme && scheme.required && scheme.required.includes('decimals') && typeof src === 'string') {
    const value = Number(src);
    return {
      positive: value > 0,
      equalZero: value === 0,
      decimals: value
    }
  }
  if (scheme.type === 'array' && !Array.isArray(src)) {
  
    return Object.keys(src).map(item => validator(item, scheme.items[0], strictByScheme));
  }
  if (scheme.type === 'array' && Array.isArray(src)) {

    return src.map(item => validator(item, scheme.items[0], strictByScheme));
  }
  return validator(src, scheme, strictByScheme);
};

function setDefaultValueByType(type, requiredField, schema) {
  if (!requiredField || !schema || !schema.properties) {
    switch (type) {
      case 'object': return {};
      case 'array': return [];
      default: return null;
    }
  }
  if (type === 'object') {
    const output = {};
    for (const field of requiredField) {
      if (schema.properties && schema.properties[field].required) {
        output[field] = setDefaultValueByType(schema.properties[field].type, schema.properties[field].required, schema.properties[field]);
      } else {
        output[field] = setDefaultValueByType(schema.properties[field].type);
      }
    }
    return output;
  }
  if (type === 'array') {
    const output = [];
    for (const field of requiredField) {
      if (schema.items && schema.items[0].required) {
        output.push(setDefaultValueByType(schema.items[0].type, schema.items[0].required, schema.items[field]));
      } else {
        output[field] = setDefaultValueByType(schema.properties[field].type);
      }
    }
    return output;
  }
  return null;
};

module.exports = {
  validator
};
