/* eslint-disable no-sync */
// Usage: node import-apprentices path/file.csv

const { CsvRegistrationParser, CsvColumn } = require('../../lib/infrastructure/serializers/csv/csv-registration-parser');
const { checkValidation } = require('../../lib/domain/validators/schooling-registration-validator');
const fs = require('fs');
const { knex } = require('../../db/knex-database-connection');

const COLUMNS = [
  new CsvColumn({ name: 'nationalApprenticeId', label: 'Identifiant unique*', isRequired: true }),
  new CsvColumn({ name: 'firstName', label: 'Premier prénom*', isRequired: true, checkEncoding: true }),
  new CsvColumn({ name: 'middleName', label:'Deuxième prénom' }),
  new CsvColumn({ name: 'thirdName', label:'Troisième prénom' }),
  new CsvColumn({ name: 'lastName', label:'Nom de famille*', isRequired: true }),
  new CsvColumn({ name: 'preferredLastName', label:'Nom d’usage' }),
  new CsvColumn({ name: 'birthdate', label:'Date de naissance (jj/mm/aaaa)*', isRequired: true, isDate: true }),
  new CsvColumn({ name: 'birthCityCode', label:'Code commune naissance**' }),
  new CsvColumn({ name: 'birthCity', label:'Libellé commune naissance**' }),
  new CsvColumn({ name: 'birthProvinceCode', label:'Code département naissance*', isRequired: true }),
  new CsvColumn({ name: 'birthCountryCode', label:'Code pays naissance*', isRequired: true }),
  new CsvColumn({ name: 'status', label:'Statut*', isRequired: true }),
  new CsvColumn({ name: 'MEFCode', label:'Code MEF*', isRequired: true }),
  new CsvColumn({ name: 'division', label:'Division*', isRequired: true }),
  new CsvColumn({ name: 'uai', label:'UAI*', isRequired: true }),
];

class ApprenticeSchoolingRegistrationSet {
  constructor() {
    this.registrations = [];
  }

  addRegistration(registrationAttributes) {
    checkValidation(registrationAttributes);
    const transformedAttributes = this._transform(registrationAttributes);
    this.registrations.push(transformedAttributes);
  }

  _transform(registrationAttributes)  {
    const { birthCountryCode } = registrationAttributes;
    return {
      ...registrationAttributes,
      birthCountryCode: birthCountryCode.slice(-3),
    };
  }
}

class CsvApprenticesParser extends CsvRegistrationParser {
  constructor(input, oranizationByUAI) {
    const registrationSet = new ApprenticeSchoolingRegistrationSet();
    super(input, null, COLUMNS, registrationSet);
    this.organizationByUai = oranizationByUAI;
  }

  _lineToRegistrationAttributes(line) {
    const registrationAttributes = {};

    this._columns.forEach((column) => {
      const value = line[column.label];
      if (column.isDate) {
        registrationAttributes[column.name] = this._buildDateAttribute(value);
      } else if (column.name === 'uai') {
        registrationAttributes.organizationId = this.organizationByUai[value];
      } else {
        registrationAttributes[column.name] = value;
      }
    });

    return registrationAttributes;
  }
}

async function findOrganizationByUai() {
  const organizations = await knex.select(['id as organizationId', 'externalId']).from('organizations').where({ type: 'SCO' });
  const organizationByUai = {};

  organizations.forEach(({ organizationId, externalId }) => organizationByUai[externalId] = organizationId);

  return organizationByUai;
}

async function importApprentices(filePath, fileSystem) {
  const input = fileSystem.readFileSync(filePath);
  const organizationByUai = await findOrganizationByUai();

  const csvApprenticesParser = new  CsvApprenticesParser(input, organizationByUai);
  const schoolingRegistrationSet = csvApprenticesParser.parse();
  await knex.batchInsert('schooling-registrations', schoolingRegistrationSet.registrations);
}

async function main() {
  return importApprentices(process.argv[2], fs);
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}

module.exports = importApprentices;
