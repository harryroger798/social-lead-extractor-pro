#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Script to add Jupiter Transit translations to all 10 languages
 * This script reads the JSON translation files and adds them to translations.ts
 */

const fs = require('fs');
const path = require('path');

const TRANSLATIONS_FILE = path.join(__dirname, '..', 'src', 'lib', 'i18n', 'translations.ts');

// Languages and their line numbers where we need to insert (before the closing brace)
// These are the line numbers of the closing "  }," for each language section
const LANGUAGE_SECTIONS = {
  en: { start: 7, multiline: true },
  hi: { start: 1726, multiline: true },
  ta: { start: 3383, multiline: true },
  te: { start: 5010, multiline: false },
  bn: { start: 5206, multiline: false },
  mr: { start: 5402, multiline: false },
  gu: { start: 5598, multiline: false },
  kn: { start: 5794, multiline: false },
  ml: { start: 5990, multiline: false },
  pa: { start: 6186, multiline: false }
};

function loadJsonFiles(jsonFiles) {
  // If no files specified, use default Jupiter Transit files
  const files = jsonFiles.length > 0 ? jsonFiles : [
    'jupiter-transit-translations.json',
    'jupiter-transit-signs-translations.json',
    'jupiter-transit-signs-2-translations.json',
    'jupiter-transit-signs-3-translations.json'
  ];
  
  const allKeys = {};
  
  for (const file of files) {
    // Handle both absolute paths and relative paths
    const filePath = path.isAbsolute(file) ? file : path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const keys = data.keys || data;
      Object.assign(allKeys, keys);
      console.log(`Loaded ${Object.keys(keys).length} keys from ${path.basename(file)}`);
    } else {
      console.log(`File not found: ${file}`);
    }
  }
  
  return allKeys;
}

function generatePairs(keys, language) {
  const pairs = [];
  for (const [key, translations] of Object.entries(keys)) {
    if (translations[language]) {
      const escapedValue = translations[language].replace(/"/g, '\\"');
      pairs.push(`"${key}": "${escapedValue}"`);
    }
  }
  return pairs;
}

function findLanguageSectionEnd(content, language) {
  // Find the language section start
  const langPattern = new RegExp(`^(\\s*)${language}:\\s*\\{`, 'm');
  const langMatch = content.match(langPattern);
  
  if (!langMatch) {
    console.error(`Could not find language section for ${language}`);
    return null;
  }

  const langStartIndex = langMatch.index;
  
  // Find the closing brace for this language section by counting braces
  let braceCount = 0;
  let langEndIndex = langStartIndex;
  let foundOpen = false;
  
  for (let i = langStartIndex; i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      foundOpen = true;
    } else if (content[i] === '}') {
      braceCount--;
      if (foundOpen && braceCount === 0) {
        langEndIndex = i;
        break;
      }
    }
  }

  return langEndIndex;
}

function findLanguageSectionStart(content, language) {
  // Find the language section start
  const langPattern = new RegExp(`^(\\s*)${language}:\\s*\\{`, 'm');
  const langMatch = content.match(langPattern);
  
  if (!langMatch) {
    return null;
  }

  return langMatch.index;
}

function addKeysToLanguage(content, language, keys, isMultiline) {
  const startIndex = findLanguageSectionStart(content, language);
  const endIndex = findLanguageSectionEnd(content, language);
  
  if (startIndex === null || endIndex === null) {
    return content;
  }

  // Check if keys already exist - only within THIS language's section
  const langContent = content.substring(startIndex, endIndex);
  const existingKeys = [];
  const newKeys = [];
  
  for (const [key, translations] of Object.entries(keys)) {
    if (translations[language]) {
      const keyPattern = new RegExp(`["']${key.replace(/\./g, '\\.')}["']:`);
      if (keyPattern.test(langContent)) {
        existingKeys.push(key);
      } else {
        newKeys.push({ key, value: translations[language] });
      }
    }
  }

  if (existingKeys.length > 0) {
    console.log(`  Skipping ${existingKeys.length} existing keys`);
  }

  if (newKeys.length === 0) {
    console.log(`  No new keys to add for ${language}`);
    return content;
  }

  // Generate the pairs
  const pairs = newKeys.map(({ key, value }) => {
    const escapedValue = value.replace(/"/g, '\\"');
    return `"${key}": "${escapedValue}"`;
  });

  // Insert the keys before the closing brace
  // First, find the actual insertion point - we need to go back from endIndex
  // to find where the last property ends
  let insertPos = endIndex;
  
  // Go backwards to skip whitespace before the closing brace
  while (insertPos > startIndex && /[\s\n\r]/.test(content[insertPos - 1])) {
    insertPos--;
  }
  
  // Now check what character is at insertPos-1
  // If it's a comma, we don't need to add another comma
  // If it's }, we're after a nested object (which may or may not have a trailing comma)
  // If it's ", we're after a string value
  const charBefore = content[insertPos - 1];
  const needsLeadingComma = charBefore !== ',';
  
  let insertion;
  if (isMultiline) {
    // For multi-line format (en, hi, ta), add with proper indentation
    if (needsLeadingComma) {
      insertion = ',\n    ' + pairs.join(',\n    ');
    } else {
      insertion = '\n    ' + pairs.join(',\n    ');
    }
  } else {
    // For compact format, add inline
    if (needsLeadingComma) {
      insertion = ', ' + pairs.join(', ');
    } else {
      insertion = ' ' + pairs.join(', ');
    }
  }

  // Insert at insertPos (after the last property, before whitespace and closing brace)
  content = content.substring(0, insertPos) + insertion + content.substring(insertPos);
  console.log(`  Added ${newKeys.length} keys to ${language}`);
  
  return content;
}

function main() {
  // Parse command-line arguments for JSON files
  const args = process.argv.slice(2);
  const jsonFiles = args.filter(arg => arg.endsWith('.json'));
  
  console.log('Loading translation JSON files...');
  const keys = loadJsonFiles(jsonFiles);
  console.log(`Total keys: ${Object.keys(keys).length}`);
  console.log('');

  console.log('Reading translations.ts...');
  let content = fs.readFileSync(TRANSLATIONS_FILE, 'utf8');
  
  const languages = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'];
  
  for (const lang of languages) {
    console.log(`Processing ${lang}...`);
    const isMultiline = ['en', 'hi', 'ta'].includes(lang);
    content = addKeysToLanguage(content, lang, keys, isMultiline);
  }

  // Validate
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    console.error(`Validation failed: Unbalanced braces (${openBraces} open, ${closeBraces} close)`);
    process.exit(1);
  }
  
  console.log('');
  console.log('Validation passed!');
  
  fs.writeFileSync(TRANSLATIONS_FILE, content, 'utf8');
  console.log('Successfully updated translations.ts');
}

main();
