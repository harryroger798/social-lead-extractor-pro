const fs = require('fs');
const path = require('path');

// Read the translations file
const translationsPath = path.join(__dirname, '../src/lib/i18n/translations.ts');
let content = fs.readFileSync(translationsPath, 'utf8');

// Extract pitraDosh keys from English section (lines 1424-1689)
const lines = content.split('\n');
const pitraDoshKeys = [];

// Find English doshas section and extract pitraDosh keys
let inEnglishDoshas = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('"pitraDosh.') && i < 1700) {
    // Extract the key-value pair
    const match = line.match(/"(pitraDosh\.[^"]+)":\s*"([^"]+)"/);
    if (match) {
      pitraDoshKeys.push({ key: match[1], value: match[2] });
    }
  }
}

console.log(`Found ${pitraDoshKeys.length} pitraDosh keys in English section`);

// Compact format languages and their line numbers for doshas section
const compactLangs = [
  { lang: 'te', doshasLine: 5106 },
  { lang: 'bn', doshasLine: 5302 },
  { lang: 'mr', doshasLine: 5498 },
  { lang: 'gu', doshasLine: 5694 },
  { lang: 'kn', doshasLine: 5890 },
  { lang: 'ml', doshasLine: 6087 },
  { lang: 'pa', doshasLine: 6284 }
];

// For each compact language, we need to find the doshas line and add the pitraDosh keys
// The doshas section ends with }, so we need to insert before the closing }

// Process each language
for (const langInfo of compactLangs) {
  console.log(`Processing ${langInfo.lang}...`);
  
  // Find the doshas line for this language
  const doshasLineIndex = lines.findIndex((line, idx) => 
    idx > langInfo.doshasLine - 50 && 
    idx < langInfo.doshasLine + 50 && 
    line.trim().startsWith('doshas: {')
  );
  
  if (doshasLineIndex === -1) {
    console.log(`  Could not find doshas line for ${langInfo.lang}`);
    continue;
  }
  
  console.log(`  Found doshas at line ${doshasLineIndex + 1}`);
  
  // Check if pitraDosh keys already exist (look for the actual flat key format)
  const doshasLine = lines[doshasLineIndex];
  // Check for the specific flat key format with quotes and dot notation
  if (doshasLine.includes('"pitraDosh.causes.cause1":')) {
    console.log(`  ${langInfo.lang} already has pitraDosh keys, skipping`);
    continue;
  }
  
  // Double check - count how many pitraDosh. keys exist
  const existingCount = (doshasLine.match(/"pitraDosh\./g) || []).length;
  console.log(`  Existing pitraDosh. keys: ${existingCount}`);
  
  // Build the pitraDosh keys string to insert
  const keysToInsert = pitraDoshKeys.map(k => `"${k.key}": "${k.value}"`).join(', ');
  
  // Find the position to insert (before the closing })
  // The doshas line ends with },
  const insertPos = doshasLine.lastIndexOf('}');
  if (insertPos === -1) {
    console.log(`  Could not find closing } in doshas line for ${langInfo.lang}`);
    continue;
  }
  
  // Insert the keys before the closing }
  const newDoshasLine = doshasLine.slice(0, insertPos) + ', ' + keysToInsert + doshasLine.slice(insertPos);
  lines[doshasLineIndex] = newDoshasLine;
  
  console.log(`  Added ${pitraDoshKeys.length} pitraDosh keys to ${langInfo.lang}`);
}

// Write the updated content back
const newContent = lines.join('\n');
fs.writeFileSync(translationsPath, newContent, 'utf8');

console.log('\nDone! Updated translations.ts');
