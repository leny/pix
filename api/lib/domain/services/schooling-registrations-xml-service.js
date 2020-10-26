const { FileValidationError, SameNationalStudentIdInFileError } = require('../errors');
const fs = require('fs');
const iconv = require('iconv-lite');
const moment = require('moment');
const parseString = require('xml2js').parseString;
const saxParser = require('sax').createStream(true);
const saxPath = require('saxpath');
const xmlEncoding = require('xml-buffer-tostring').xmlEncoding;
const { isEmpty, isNil } = require('lodash');

const DEFAULT_FILE_ENCODING = 'iso-8859-15';
const DIVISION = 'D';
const NODE_ORGANIZATION_UAI = '/BEE_ELEVES/PARAMETRES';
const NODES_SCHOOLING_RESGISTRATIONS = '/BEE_ELEVES/DONNEES/*/*';
const UAI_SIECLE_FILE_NOT_MATCH_ORGANIZATION_UAI = 'Aucun étudiant n’a été importé. L’import n’est pas possible car l’UAI du fichier SIECLE ne correspond pas à celui de votre établissement. En cas de difficulté, contactez support.pix.fr.';

module.exports = {
  extractSchoolingRegistrationsInformationFromSIECLE,
};

async function extractSchoolingRegistrationsInformationFromSIECLE(payload, organization) {
  const firstline = await _readFirstLineFromFile(payload.path);
  const encoding = xmlEncoding(Buffer.from(firstline)) || DEFAULT_FILE_ENCODING;

  return new Promise(function(resolve, reject) {
    const fileStream = fs.createReadStream(payload.path).pipe(iconv.decodeStream(encoding));

    const streamerToParseOrganizationUAI = new saxPath.SaXPath(saxParser, NODE_ORGANIZATION_UAI);
    const streamerToParseSchoolingRegistrations = new saxPath.SaXPath(saxParser, NODES_SCHOOLING_RESGISTRATIONS);

    const mapSchoolingRegistrationsByStudentId = new Map();
    const nationalStudentIds = [];

    streamerToParseOrganizationUAI.on('match', function(xmlFormat) {
      parseString(xmlFormat, function(err, jsFormat) {
        if (jsFormat.PARAMETRES) {
          const UAIFromSIECLE = _getValueFromParsedElement(jsFormat.PARAMETRES.UAJ);
          if (UAIFromSIECLE !== organization.externalId) {
            throw new FileValidationError(UAI_SIECLE_FILE_NOT_MATCH_ORGANIZATION_UAI);
          }
        }
      });
    });

    streamerToParseSchoolingRegistrations.on('match', function(xmlFormat) {
      parseString(xmlFormat, function(err, jsFormat) {

        if (jsFormat.ELEVE) {
          const isStudentNotLeftSchoolingRegistration = isEmpty(jsFormat.ELEVE.DATE_SORTIE);
          const isStudentNotYetArrivedSchoolingRegistration = !isEmpty(jsFormat.ELEVE.ID_NATIONAL);
          const isStudentNotDuplicatedInTheSIECLEFile = !mapSchoolingRegistrationsByStudentId.has(jsFormat.ELEVE.$.ELEVE_ID);

          if (isStudentNotLeftSchoolingRegistration && isStudentNotYetArrivedSchoolingRegistration && isStudentNotDuplicatedInTheSIECLEFile) {
            const nationalStudentId = _getValueFromParsedElement(jsFormat.ELEVE.ID_NATIONAL);
            if (nationalStudentId && nationalStudentIds.indexOf(nationalStudentId) !== -1) {
              throw new SameNationalStudentIdInFileError(nationalStudentId);
            }
            nationalStudentIds.push(nationalStudentId);
            mapSchoolingRegistrationsByStudentId.set(jsFormat.ELEVE.$.ELEVE_ID, _mapStudentInformationToSchoolingRegistration(jsFormat));
          }
        }

        if (jsFormat.STRUCTURES_ELEVE && mapSchoolingRegistrationsByStudentId.get(jsFormat.STRUCTURES_ELEVE.$.ELEVE_ID)) {
          const structureElement = jsFormat.STRUCTURES_ELEVE.STRUCTURE[0];
          if (structureElement.TYPE_STRUCTURE[0] === DIVISION && structureElement.CODE_STRUCTURE[0] !== 'Inactifs') {
            mapSchoolingRegistrationsByStudentId.get(jsFormat.STRUCTURES_ELEVE.$.ELEVE_ID).division = structureElement.CODE_STRUCTURE[0];
          } else {
            mapSchoolingRegistrationsByStudentId.delete(jsFormat.STRUCTURES_ELEVE.$.ELEVE_ID);
          }
        }
      });

    });
    fileStream.pipe(saxParser);

    streamerToParseSchoolingRegistrations.on('end', function() {
      fs.unlink(payload.path, (err) => {
        if (err) {
          throw err; // Todo create custom exception
        }
        resolve(isEmpty(mapSchoolingRegistrationsByStudentId.values() ? [] : Array.from(mapSchoolingRegistrationsByStudentId.values())));
      });

      streamerToParseSchoolingRegistrations.on('error', function(err) {
        reject(err);
      });
    });
  });
}

function _mapStudentInformationToSchoolingRegistration(jsFormat) {
  return {
    studentId: _getValueFromParsedElement(jsFormat.ELEVE.$.ELEVE_ID),
    lastName: _getValueFromParsedElement(jsFormat.ELEVE.NOM_DE_FAMILLE),
    preferredLastName: _getValueFromParsedElement(jsFormat.ELEVE.NOM_USAGE),
    firstName: _getValueFromParsedElement(jsFormat.ELEVE.PRENOM),
    middleName: _getValueFromParsedElement(jsFormat.ELEVE.PRENOM2),
    thirdName: _getValueFromParsedElement(jsFormat.ELEVE.PRENOM3),
    birthdate: moment(jsFormat.ELEVE.DATE_NAISS, 'DD/MM/YYYY').format('YYYY-MM-DD') || null,
    birthCountryCode: _getValueFromParsedElement(jsFormat.ELEVE.CODE_PAYS, null),
    birthProvinceCode: _getValueFromParsedElement(jsFormat.ELEVE.CODE_DEPARTEMENT_NAISS),
    birthCityCode: _getValueFromParsedElement(jsFormat.ELEVE.CODE_COMMUNE_INSEE_NAISS),
    birthCity: _getValueFromParsedElement(jsFormat.ELEVE.VILLE_NAISS),
    MEFCode: (jsFormat.ELEVE.SCOLARITE_AN_DERNIER) ? _getValueFromParsedElement(jsFormat.ELEVE.SCOLARITE_AN_DERNIER[0].CODE_MEF) : null,
    status: _getValueFromParsedElement(jsFormat.ELEVE.CODE_STATUT),
    nationalStudentId: _getValueFromParsedElement(jsFormat.ELEVE.ID_NATIONAL),
  };
}

function _getValueFromParsedElement(obj) {
  if (isNil(obj)) return null;
  return (Array.isArray(obj) && !isEmpty(obj)) ? obj[0] : obj;
}

function _readFirstLineFromFile(path) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(path);
    const lineEnding = '\n';
    const BOM = 0xFEFF;
    let value = '';
    let position = 0;
    let index;
    readStream.on('data', (chunk) => {
      index = chunk.indexOf(lineEnding);
      value += chunk;
      if (index === -1) {
        position += chunk.length;
      } else {
        position += index;
        readStream.close();
      }
    })
      .on('close', () => resolve(value.slice(value.charCodeAt(0) === BOM ? 1 : 0, position)))
      .on('error', (err) => reject(err));
  });
}
