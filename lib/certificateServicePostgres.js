// PostgreSQL Certificate Service (Deprecated - using Firebase instead)
// This file is maintained for compatibility but uses Firebase under the hood

// Import Firebase modules
const { db } = require('./firebase');
const { collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

// Use the Firebase CertificateService instead
const { CertificateService } = require('./certificateService');

// Map the PostgreSQL-style functions to Firebase functions
async function getCertificatesByUniversityCode(searchId) {
  return await CertificateService.getCertificatesByUniversityCode(searchId);
}

async function getCertificateById(id) {
  return await CertificateService.getCertificateById(id);
}

async function getAllCertificates() {
  return await CertificateService.getAllCertificates();
}

// Placeholder functions for compatibility
async function addCertificate(certificate) {
  console.warn('addCertificate: PostgreSQL not supported, using Firebase is recommended');
  throw new Error('PostgreSQL not supported, use Firebase instead');
}

async function addCertificates(certificates) {
  console.warn('addCertificates: PostgreSQL not supported, using Firebase is recommended');
  throw new Error('PostgreSQL not supported, use Firebase instead');
}

async function initializeTable() {
  console.warn('initializeTable: PostgreSQL not supported, using Firebase is recommended');
  throw new Error('PostgreSQL not supported, use Firebase instead');
}

module.exports = { 
  getCertificatesByUniversityCode,
  getCertificateById,
  getAllCertificates,
  addCertificate,
  addCertificates,
  initializeTable
};