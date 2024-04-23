function validator(sourceJson, scheme, strictByScheme) {
  const outputObject = {};
  if (!scheme) {
    return sourceJson || null;
  };
  for (const property in sourceJson) {
    if (scheme.required && scheme.required.includes(property)) {
        if (scheme.properties[property].type === 'string') {
          outputObject[property] = sourceJson[property] || setDefaultValueByType('string');
        } else {
          outputObject[property] = assignSpecificObject(sourceJson[property], scheme.properties[property], strictByScheme);
        }
    } else if (!strictByScheme) {
      outputObject[property] = sourceJson[property];
    }
  }
  if (scheme.required) {
    for (const requiredField of scheme.required) {
      if (!sourceJson[requiredField]) {
        outputObject[requiredField] = setDefaultValueByType(scheme.properties[requiredField].type);
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
    console.log('first')
    return Object.keys(src).map(item => validator(item, scheme.items[0], strictByScheme)) || setDefaultValueByType('array');
  }
  if (scheme.type === 'array' && Array.isArray(src)) return src.map(item => validator(item, scheme.items[0], strictByScheme)) || setDefaultValueByType('array');
  return validator(src, scheme, strictByScheme);
}

function setDefaultValueByType(type, requiredField) {
  switch (type) {
    case 'string': return '';
    case 'number': return 0;
    case 'array': return [];
    case 'object': return {};
    default: return null;
  }
}
module.exports = {
  validator
};
