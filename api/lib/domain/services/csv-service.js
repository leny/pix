const _ = require('lodash');

const valueTypes = {
  TEXT: 'text',
  NUMBER: 'number',
};

function updateCsvLine({ line, rawData, headerPropertyMap }) {
  const headers =  _.map(headerPropertyMap, 'headerName');

  _.each(headerPropertyMap, (csvParams) => {
    line = updateCsvLineByProperty({ line, rawData, csvParams, headers });
  });
}

function updateCsvLineByProperty({ line, rawData, csvParams, headers }) {
  const { propertyName, headerName, type } = csvParams;
  const value = rawData[propertyName];

  if (type === valueTypes.TEXT) {
    return addTextCell(headerName, value, headers)(line);
  }
  if (type === valueTypes.NUMBER) {
    return addNumberCell(headerName, value, headers)(line);
  }
  throw new Error(`Missing value type: ${type} for property: ${propertyName}`);
}

function addNumberCell(title, data, headers) {
  return (line) => {
    line[headers.indexOf(title)] = toCsvNumber(data);
    return line;
  };
}

function addTextCell(title, data, headers) {
  return (line) => {
    line[headers.indexOf(title)] = toCsvText(data);
    return line;
  };
}

const _surroundWith = (outterString) => (innerString) => [outterString, innerString, outterString].join('');

function getHeadersWithQuotes(headers) {
  return _.map(headers, _surroundWith('"'));
}

function toCsvText(input) {
  return `"${input.toString().replace(/"/g, '""')}"`;
}

function toCsvNumber(input) {
  return input.toString().replace('.', ',');
}

module.exports = {
  updateCsvLine,
  addNumberCell,
  addTextCell,
  getHeadersWithQuotes,
  valueTypes,
};