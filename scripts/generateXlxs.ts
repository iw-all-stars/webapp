import path from 'path';
import { fileURLToPath } from 'url';
import { faker } from '@faker-js/faker';
import * as XLSX from 'xlsx';

// Function to generate a single line of data
function generateLine(): [string, string, string] {
  const lastName = faker.person.lastName();
  const firstName = faker.person.firstName();
  const email = faker.internet.email();

  return [lastName, firstName, email];
}

// Generate 1000 lines of data
const lines: Array<[string, string, string]> = [];
for (let i = 0; i < 1000; i++) {
  const line = generateLine();
  lines.push(line);
}

// Create a workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.aoa_to_sheet([['Nom', 'Prenom', 'Email'], ...lines]);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

// Write the workbook to a file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filename = path.join(__dirname, 'generatedDataFaker.xlsx');
XLSX.writeFile(workbook, filename);

console.log(`Data saved to ${filename}`);
