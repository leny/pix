const { parseAsync } = require('json2csv');
const { CsvParsingError } = require('../../../../lib/domain/errors');

async function getCsvContent({
  data,
  fileHeaders,
  delimiter = ';',
  withBOM = true,
  eol = '\n',
}) {
  try {
    const options = { fields: fileHeaders, delimiter, withBOM, eol };
    const csvContent = await parseAsync(data, options);
    return csvContent;
  } catch (err) {
    throw new CsvParsingError();
  }
}

module.exports = {
  getCsvContent,
};
