#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Flat Translation Key Automation Script
 * 
 * This script adds flat translation keys (like "transits.jupiter.title") directly to 
 * language objects in the translations.ts file. It works with both multi-line format
 * (en, hi, ta) and compact single-line format (te, bn, mr, gu, kn, ml, pa).
 * 
 * Usage:
 *   node add-flat-translation-keys.js <json-input-file> [--test-language <lang>] [--dry-run]
 * 
 * JSON Input Format:
 *   {
 *     "keys": {
 *       "transits.jupiter.title": {
 *         "en": "Jupiter Transit 2026",
 *         "hi": "बृहस्पति गोचर 2026",
 *         ...
 *       }
 *     }
 *   }
 */

const fs = require('fs');
const path = require('path');

const TRANSLATIONS_FILE = path.join(__dirname, '..', 'src', 'lib', 'i18n', 'translations.ts');
const LANGUAGES = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'];

// Languages that use multi-line format
const MULTILINE_LANGUAGES = ['en', 'hi', 'ta'];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    inputFile: null,
    testLanguage: null,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--test-language' && args[i + 1]) {
      options.testLanguage = args[i + 1];
      i++;
    } else if (args[i] === '--dry-run') {
      options.dryRun = true;
    } else if (!args[i].startsWith('--')) {
      options.inputFile = args[i];
    }
  }

  return options;
}

function loadInputFile(inputFile) {
  let fullPath = path.isAbsolute(inputFile) ? inputFile : path.join(process.cwd(), inputFile);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(__dirname, inputFile);
  }
  if (!fs.existsSync(fullPath)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function findLanguageSection(content, language) {
  // Find the language section start
  const langPattern = new RegExp(`^(\\s*)${language}:\\s*\\{`, 'm');
  const langMatch = content.match(langPattern);
  
  if (!langMatch) {
    return null;
  }

  const langStartIndex = langMatch.index;
  const indent = langMatch[1];
  
  // Find the closing brace for this language section
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

  return {
    startIndex: langStartIndex,
    endIndex: langEndIndex,
    indent: indent,
    content: content.substring(langStartIndex, langEndIndex + 1)
  };
}

function addKeysToLanguage(content, language, keys, dryRun) {
  const langSection = findLanguageSection(content, language);
  
  if (!langSection) {
    console.error(`  Could not find language section for "${language}"`);
    return content;
  }

  const isMultiline = MULTILINE_LANGUAGES.includes(language);
  const existingContent = langSection.content;
  
  // Filter out keys that already exist
  const keysToAdd = [];
  for (const [key, translations] of Object.entries(keys)) {
    if (translations[language]) {
      // Check if key already exists
      const keyPattern = new RegExp(`["']?${key.replace(/\./g, '\\.')}["']?:\\s*["']`);
      if (keyPattern.test(existingContent)) {
        console.log(`    Skipping existing key: ${key}`);
        continue;
      }
      keysToAdd.push({ key, value: translations[language] });
    }
  }

  if (keysToAdd.length === 0) {
    console.log(`  No keys to add for ${language}`);
    return content;
  }

  if (dryRun) {
    console.log(`  Would add ${keysToAdd.length} keys to ${language}`);
    console.log(`  Keys: ${keysToAdd.slice(0, 3).map(k => k.key).join(', ')}${keysToAdd.length > 3 ? '...' : ''}`);
    return content;
  }

  // Generate the insertion string
  const insertionPoint = langSection.endIndex;

  if (isMultiline) {
    // For multi-line format, add keys with proper indentation
    const baseIndent = langSection.indent + '  ';
    const pairs = keysToAdd.map(({ key, value }) => {
      const escapedValue = value.replace(/"/g, '\\"');
      return `${baseIndent}"${key}": "${escapedValue}"`;
    });
    
    // Check if we need a comma after the last existing key
    const contentBeforeBrace = content.substring(0, insertionPoint).trimEnd();
    const needsComma = !contentBeforeBrace.endsWith(',') && !contentBeforeBrace.endsWith('{');
    
    let insertion;
    if (needsComma) {
      let insertPos = insertionPoint;
      while (insertPos > 0 && /\s/.test(content[insertPos - 1])) {
        insertPos--;
      }
      insertion = ',\n' + pairs.join(',\n') + '\n' + langSection.indent;
      content = content.substring(0, insertPos) + insertion + content.substring(insertionPoint);
    } else {
      insertion = '\n' + pairs.join(',\n') + '\n' + langSection.indent;
      content = content.substring(0, insertionPoint) + insertion + content.substring(insertionPoint);
    }
  } else {
    // For compact single-line format, we need to find the last property before the closing brace
    // The language section ends with "  }," - we need to insert before the final }
    
    // The closing brace of the language section is at langSection.endIndex
    // We need to find the position just before it (after the last property)
    
    // Go backwards from the closing brace to find the last non-whitespace character
    let insertPos = langSection.endIndex;
    
    // Skip any whitespace before the closing brace
    while (insertPos > langSection.startIndex && /[\s\n\r]/.test(content[insertPos - 1])) {
      insertPos--;
    }
    
    // Now insertPos points to just after the last character before whitespace/closing brace
    // The character at insertPos-1 should be either } (from nested object) or " (from string value)
    
    const pairs = keysToAdd.map(({ key, value }) => {
      const escapedValue = value.replace(/"/g, '\\"');
      return `"${key}": "${escapedValue}"`;
    });
    
    // Insert the new keys with a comma before them, before the closing brace
    const insertion = ', ' + pairs.join(', ');
    content = content.substring(0, langSection.endIndex) + insertion + content.substring(langSection.endIndex);
  }

  console.log(`  Added ${keysToAdd.length} keys to ${language}`);
  return content;
}

function validateOutput(content) {
  const issues = [];
  
  // Check for double commas
  if (/,,/.test(content)) {
    issues.push('Double commas detected');
  }
  
  // Check balanced braces
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
  }
  
  return issues;
}

function main() {
  const options = parseArgs();
  
  if (!options.inputFile) {
    console.log('Usage: node add-flat-translation-keys.js <json-input-file> [--test-language <lang>] [--dry-run]');
    console.log('');
    console.log('Options:');
    console.log('  --test-language <lang>  Only apply to one language for testing');
    console.log('  --dry-run               Show what would be changed without modifying');
    process.exit(1);
  }

  console.log('Flat Translation Key Automation Script');
  console.log('======================================');
  console.log(`Input file: ${options.inputFile}`);
  console.log(`Test language: ${options.testLanguage || 'all'}`);
  console.log(`Dry run: ${options.dryRun}`);
  console.log('');

  // Load input data
  const inputData = loadInputFile(options.inputFile);
  const keys = inputData.keys || inputData;
  
  console.log(`Keys to add: ${Object.keys(keys).length}`);
  console.log('');

  // Load translations file
  if (!fs.existsSync(TRANSLATIONS_FILE)) {
    console.error(`Error: Translations file not found: ${TRANSLATIONS_FILE}`);
    process.exit(1);
  }
  
  let content = fs.readFileSync(TRANSLATIONS_FILE, 'utf8');

  // Determine which languages to process
  const languagesToProcess = options.testLanguage 
    ? [options.testLanguage] 
    : LANGUAGES;

  console.log(`Processing languages: ${languagesToProcess.join(', ')}`);
  console.log('');

  // Process each language
  for (const lang of languagesToProcess) {
    console.log(`Processing ${lang}...`);
    content = addKeysToLanguage(content, lang, keys, options.dryRun);
  }

  // Validate output
  console.log('');
  console.log('Validating output...');
  const issues = validateOutput(content);
  
  if (issues.length > 0) {
    console.error('Validation errors:');
    issues.forEach(issue => console.error(`  - ${issue}`));
    process.exit(1);
  }
  
  console.log('Validation passed!');

  // Write output
  if (!options.dryRun) {
    fs.writeFileSync(TRANSLATIONS_FILE, content, 'utf8');
    console.log('');
    console.log(`Successfully updated ${TRANSLATIONS_FILE}`);
  } else {
    console.log('');
    console.log('Dry run complete. No changes were made.');
  }
}

main();
