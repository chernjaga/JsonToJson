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
}

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
}
module.exports = {
  validator
};
