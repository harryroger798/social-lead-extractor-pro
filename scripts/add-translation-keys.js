#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Translation Key Automation Script
 * 
 * This script adds new translation keys to all 10 languages in the translations.ts file.
 * It reads from a JSON input file and inserts keys into the specified section.
 * 
 * Usage:
 *   node add-translation-keys.js <json-input-file> [--test-language <lang>] [--dry-run]
 * 
 * Options:
 *   --test-language <lang>  Only apply to one language for testing (e.g., "hi" for Hindi)
 *   --dry-run               Show what would be changed without modifying the file
 * 
 * Example:
 *   node add-translation-keys.js horoscope-translations.json --test-language hi --dry-run
 *   node add-translation-keys.js horoscope-translations.json --test-language hi
 *   node add-translation-keys.js horoscope-translations.json
 */

const fs = require('fs');
const path = require('path');

const TRANSLATIONS_FILE = path.join(__dirname, '..', 'src', 'lib', 'i18n', 'translations.ts');
const LANGUAGES = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa'];

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
  // First try relative to current working directory, then relative to script directory
  let fullPath = path.isAbsolute(inputFile) ? inputFile : path.join(process.cwd(), inputFile);
  if (!fs.existsSync(fullPath)) {
    // Try relative to script directory as fallback
    fullPath = path.join(__dirname, inputFile);
  }
  if (!fs.existsSync(fullPath)) {
    console.error(`Error: Input file not found: ${inputFile}`);
    console.error(`Tried: ${path.join(process.cwd(), inputFile)}`);
    console.error(`Tried: ${path.join(__dirname, inputFile)}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function generateKeyValuePairs(keys, language, existingContent = '') {
  const pairs = [];
  for (const [key, translations] of Object.entries(keys)) {
    if (translations[language]) {
      // Check if key already exists in the section content
      const keyPattern = new RegExp(`["']?${key.replace(/\./g, '\\.')}["']?:\\s*["']`);
      if (existingContent && keyPattern.test(existingContent)) {
        console.log(`    Skipping existing key: ${key}`);
        continue;
      }
      // Quote keys that contain dots or special characters
      const needsQuotes = /[.\-\s]/.test(key);
      const quotedKey = needsQuotes ? `"${key}"` : key;
      // Escape any double quotes in the value
      const escapedValue = translations[language].replace(/"/g, '\\"');
      pairs.push(`${quotedKey}: "${escapedValue}"`);
    }
  }
  return pairs;
}

function findSectionEndPosition(content, language, section, subsection) {
  // Find the language section
  const langPattern = new RegExp(`^\\s*${language}:\\s*\\{`, 'm');
  const langMatch = content.match(langPattern);
  
  if (!langMatch) {
    console.error(`Error: Could not find language section for "${language}"`);
    return null;
  }

  const langStartIndex = langMatch.index;
  
  // Find the section within the language (e.g., "horoscope:")
  const sectionPattern = new RegExp(`${section}:\\s*\\{`, 'g');
  sectionPattern.lastIndex = langStartIndex;
  const sectionMatch = sectionPattern.exec(content);
  
  if (!sectionMatch || sectionMatch.index < langStartIndex) {
    console.error(`Error: Could not find section "${section}" in language "${language}"`);
    return null;
  }

  const sectionStartIndex = sectionMatch.index;
  
  // If there's a subsection, find it
  if (subsection) {
    const subsectionPattern = new RegExp(`${subsection}:\\s*\\{`, 'g');
    subsectionPattern.lastIndex = sectionStartIndex;
    const subsectionMatch = subsectionPattern.exec(content);
    
    if (subsectionMatch) {
      // Find the closing brace of the subsection
      return findClosingBrace(content, subsectionMatch.index + subsectionMatch[0].length - 1);
    }
  }
  
  // Find the closing brace of the section
  return findClosingBrace(content, sectionStartIndex + sectionMatch[0].length - 1);
}

function findClosingBrace(content, openBraceIndex) {
  let depth = 1;
  let i = openBraceIndex + 1;
  
  while (i < content.length && depth > 0) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') depth--;
    i++;
  }
  
  return depth === 0 ? i - 1 : null;
}

function insertKeysIntoSection(content, language, section, subsection, keys, dryRun) {
  // Find the section end position first to get section content for duplicate checking
  const closingBraceIndex = findSectionEndPosition(content, language, section, subsection);
  
  if (closingBraceIndex === null) {
    console.error(`  Could not find insertion point for ${language}`);
    return content;
  }

  // Determine indentation by looking at the content before the closing brace
  const beforeBrace = content.substring(0, closingBraceIndex);
  const lastNewline = beforeBrace.lastIndexOf('\n');
  const lineBeforeBrace = beforeBrace.substring(lastNewline + 1);
  
  // Check if the section is on a single line (compact format)
  const sectionStart = content.lastIndexOf(`${section}:`, closingBraceIndex);
  const sectionContent = content.substring(sectionStart, closingBraceIndex);
  
  // Pass existing section content to filter out duplicate keys
  const pairs = generateKeyValuePairs(keys, language, sectionContent);
  
  if (pairs.length === 0) {
    console.log(`  No keys to add for ${language}`);
    return content;
  }
  const isCompactFormat = !sectionContent.includes('\n') || sectionContent.split('\n').length <= 2;
  
  let insertion;
  if (isCompactFormat) {
    // For compact single-line format, add keys inline
    insertion = ', ' + pairs.join(', ');
  } else {
    // For multi-line format, add keys with proper indentation
    // Don't add trailing comma on the last key to avoid syntax errors
    const baseIndent = lineBeforeBrace.match(/^\s*/)[0];
    const keyIndent = baseIndent + '  ';
    insertion = '\n' + pairs.map((p, i) => `${keyIndent}${p}${i < pairs.length - 1 ? ',' : ''}`).join('\n') + '\n' + baseIndent;
  }

  // Check if there's content before the closing brace that needs a comma
  const contentBeforeBrace = content.substring(0, closingBraceIndex).trimEnd();
  const needsComma = !contentBeforeBrace.endsWith(',') && !contentBeforeBrace.endsWith('{');
  
  if (needsComma && !isCompactFormat) {
    // Find the last non-whitespace character before the closing brace
    let insertPos = closingBraceIndex;
    while (insertPos > 0 && /\s/.test(content[insertPos - 1])) {
      insertPos--;
    }
    
    if (dryRun) {
      console.log(`  Would add ${pairs.length} keys to ${language}/${section}${subsection ? '/' + subsection : ''}`);
      console.log(`  Keys: ${pairs.slice(0, 3).join(', ')}${pairs.length > 3 ? '...' : ''}`);
      return content;
    }
    
    // Insert comma after last content, then the new keys
    content = content.substring(0, insertPos) + ',' + insertion + content.substring(closingBraceIndex);
  } else {
    if (dryRun) {
      console.log(`  Would add ${pairs.length} keys to ${language}/${section}${subsection ? '/' + subsection : ''}`);
      console.log(`  Keys: ${pairs.slice(0, 3).join(', ')}${pairs.length > 3 ? '...' : ''}`);
      return content;
    }
    
    content = content.substring(0, closingBraceIndex) + insertion + content.substring(closingBraceIndex);
  }

  console.log(`  Added ${pairs.length} keys to ${language}/${section}${subsection ? '/' + subsection : ''}`);
  return content;
}

function addKeysToSubsection(content, language, section, subsection, keys, dryRun) {
  // For languages with compact sections (single line), we need special handling
  const langPattern = new RegExp(`^\\s*${language}:\\s*\\{`, 'm');
  const langMatch = content.match(langPattern);
  
  if (!langMatch) {
    console.error(`Error: Could not find language section for "${language}"`);
    return content;
  }

  const langStartIndex = langMatch.index;
  
  // Find the next language section to bound our search
  let nextLangIndex = content.length;
  for (const lang of LANGUAGES) {
    if (lang !== language) {
      const nextPattern = new RegExp(`^\\s*${lang}:\\s*\\{`, 'm');
      const nextMatch = content.substring(langStartIndex + 1).match(nextPattern);
      if (nextMatch) {
        const idx = langStartIndex + 1 + nextMatch.index;
        if (idx > langStartIndex && idx < nextLangIndex) {
          nextLangIndex = idx;
        }
      }
    }
  }

  // Find the section within this language's bounds
  // Use a pattern that matches the section and captures content up to closing brace
  const sectionPattern = new RegExp(`${section}:\\s*\\{`, 'g');
  sectionPattern.lastIndex = langStartIndex;
  const sectionMatch = sectionPattern.exec(content);
  
  if (!sectionMatch || sectionMatch.index >= nextLangIndex) {
    console.error(`  Could not find section "${section}" in language "${language}"`);
    return content;
  }

  let targetStartIndex = sectionMatch.index;
  let targetEndIndex;
  
  // Find the closing brace for this section by counting braces
  let braceCount = 0;
  let sectionEndIndex = targetStartIndex + sectionMatch[0].length;
  let foundOpen = false;
  
  for (let i = targetStartIndex; i < nextLangIndex && i < content.length; i++) {
    if (content[i] === '{') {
      braceCount++;
      foundOpen = true;
    } else if (content[i] === '}') {
      braceCount--;
      if (foundOpen && braceCount === 0) {
        sectionEndIndex = i;
        break;
      }
    }
  }

  // If there's a subsection, find it within the section
  if (subsection) {
    const sectionContent = content.substring(targetStartIndex, sectionEndIndex + 1);
    const subsectionPattern = new RegExp(`${subsection}:\\s*\\{`);
    const subsectionMatch = sectionContent.match(subsectionPattern);
    
    if (!subsectionMatch) {
      console.error(`  Could not find subsection "${subsection}" in section "${section}" for language "${language}"`);
      return content;
    }
    
    // Update target to point to subsection
    targetStartIndex = targetStartIndex + subsectionMatch.index;
    
    // Find the closing brace for the subsection
    braceCount = 0;
    foundOpen = false;
    for (let i = targetStartIndex; i <= sectionEndIndex; i++) {
      if (content[i] === '{') {
        braceCount++;
        foundOpen = true;
      } else if (content[i] === '}') {
        braceCount--;
        if (foundOpen && braceCount === 0) {
          targetEndIndex = i;
          break;
        }
      }
    }
  } else {
    targetEndIndex = sectionEndIndex;
  }

  // Extract target content (section or subsection) to check for duplicates
  const targetContent = content.substring(targetStartIndex, targetEndIndex + 1);
  
  // Check if this is a compact format (single line or very few lines)
  const isCompactFormat = !targetContent.includes('\n') || targetContent.split('\n').length <= 2;
  
  // Generate key-value pairs, filtering out duplicates (only check within target, not entire section)
  const pairs = generateKeyValuePairs(keys, language, targetContent);
  
  if (pairs.length === 0) {
    console.log(`  No keys to add for ${language}`);
    return content;
  }

  if (dryRun) {
    console.log(`  Would add ${pairs.length} keys to ${language}/${section}${subsection ? '/' + subsection : ''} (${isCompactFormat ? 'compact' : 'multi-line'} format)`);
    console.log(`  Keys: ${pairs.slice(0, 3).join(', ')}${pairs.length > 3 ? '...' : ''}`);
    return content;
  }

  let insertion;
  if (isCompactFormat) {
    // For compact single-line format, add keys inline before closing brace
    insertion = ', ' + pairs.join(', ');
    content = content.substring(0, targetEndIndex) + insertion + content.substring(targetEndIndex);
  } else {
    // For multi-line format, add keys with proper indentation
    const beforeBrace = content.substring(0, targetEndIndex);
    const lastNewline = beforeBrace.lastIndexOf('\n');
    const lineBeforeBrace = beforeBrace.substring(lastNewline + 1);
    const baseIndent = lineBeforeBrace.match(/^\s*/)[0];
    const keyIndent = baseIndent + '  ';
    
    // Check if we need a comma after the last existing key
    const contentBeforeBrace = content.substring(0, targetEndIndex).trimEnd();
    const needsComma = !contentBeforeBrace.endsWith(',') && !contentBeforeBrace.endsWith('{');
    
    if (needsComma) {
      // Find the last non-whitespace character before the closing brace
      let insertPos = targetEndIndex;
      while (insertPos > 0 && /\s/.test(content[insertPos - 1])) {
        insertPos--;
      }
      insertion = ',\n' + pairs.map((p, i) => `${keyIndent}${p}${i < pairs.length - 1 ? ',' : ''}`).join('\n') + '\n' + baseIndent;
      content = content.substring(0, insertPos) + insertion + content.substring(targetEndIndex);
    } else {
      insertion = '\n' + pairs.map((p, i) => `${keyIndent}${p}${i < pairs.length - 1 ? ',' : ''}`).join('\n') + '\n' + baseIndent;
      content = content.substring(0, targetEndIndex) + insertion + content.substring(targetEndIndex);
    }
  }

  console.log(`  Added ${pairs.length} keys to ${language}/${section}${subsection ? '/' + subsection : ''} (${isCompactFormat ? 'compact' : 'multi-line'} format)`);
  return content;
}

function validateOutput(content) {
  // Basic validation: check for obvious syntax errors
  const issues = [];
  
  // Check for double commas
  if (/,,/.test(content)) {
    issues.push('Double commas detected');
  }
  
  // Check for missing commas before keys (simplified check)
  if (/"\s+\w+:/.test(content)) {
    // This might be a false positive, so just warn
    console.warn('Warning: Possible missing comma detected');
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
    console.log('Usage: node add-translation-keys.js <json-input-file> [--test-language <lang>] [--dry-run]');
    console.log('');
    console.log('Options:');
    console.log('  --test-language <lang>  Only apply to one language for testing');
    console.log('  --dry-run               Show what would be changed without modifying');
    console.log('');
    console.log('Example:');
    console.log('  node add-translation-keys.js horoscope-translations.json --test-language hi --dry-run');
    process.exit(1);
  }

  console.log('Translation Key Automation Script');
  console.log('==================================');
  console.log(`Input file: ${options.inputFile}`);
  console.log(`Test language: ${options.testLanguage || 'all'}`);
  console.log(`Dry run: ${options.dryRun}`);
  console.log('');

  // Load input data
  const inputData = loadInputFile(options.inputFile);
  const { section, subsection, keys } = inputData;
  
  console.log(`Section: ${section}${subsection ? '/' + subsection : ''}`);
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
    content = addKeysToSubsection(content, lang, section, subsection, keys, options.dryRun);
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
