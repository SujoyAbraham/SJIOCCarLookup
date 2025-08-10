/**
 * Enhanced Plate Number Search Engine for React
 * Comprehensive pattern matching with security features
 */

export class SecureCarSearchEngine {
  constructor(memberData) {
    this.memberData = memberData || [];
    this.searchIndex = this.buildSearchIndex();
  }

  buildSearchIndex() {
    const index = {
      exact: new Map(),
      normalized: new Map()
    };

    this.memberData.forEach(member => {
      const carNumber = member['Plate Number'];
      if (!carNumber) return;

      // Exact match index
      index.exact.set(carNumber.toUpperCase(), member);

      // Normalized index (alphanumeric only)
      const normalized = this.normalizePlateNumber(carNumber);
      index.normalized.set(normalized, member);
    });

    return index;
  }

  searchPlateNumber(userInput) {
    if (!userInput || typeof userInput !== 'string') return null;

    const cleanInput = userInput.trim().toUpperCase();

    // Strategy 1: Exact match (100% confidence)
    if (this.searchIndex.exact.has(cleanInput)) {
      return {
        match: this.searchIndex.exact.get(cleanInput),
        matchType: 'exact',
        confidence: 100
      };
    }

    // Strategy 2: Normalized match - allows flexible formatting (dash, space, or both)
    const normalized = this.normalizePlateNumber(cleanInput);
    if (normalized.length >= 3 && normalized.length <= 10) {
      if (this.searchIndex.normalized.has(normalized)) {
        const match = this.searchIndex.normalized.get(normalized);
        return {
          match: match,
          matchType: 'normalized',
          confidence: 95
        };
      }
    }

    // No matches found
    return null;
  }

  normalizePlateNumber(carNumber) {
    return carNumber.replace(/[^A-Z0-9]/g, '');
  }

  // Find exact CSV format suggestions when user provides different formatting
  findSymbolSuggestions(userInput) {
    const userNormalized = this.normalizePlateNumber(userInput);
    const suggestions = [];
    
    // Look for plate numbers with same alphanumeric characters but different formatting
    for (const member of this.memberData) {
      const plateNumber = member['Plate Number'];
      if (!plateNumber) continue;
      
      const plateNormalized = this.normalizePlateNumber(plateNumber);
      if (plateNormalized === userNormalized && plateNumber !== userInput) {
        suggestions.push(plateNumber); // Return the exact CSV format
      }
    }
    
    return suggestions.slice(0, 1); // Return only the exact CSV format
  }

  generateCommonVariations(plateNumber) {
    const variations = new Set();
    const normalized = this.normalizePlateNumber(plateNumber);
    
    // Only generate the standard CSV format variations
    if (normalized.length >= 3) {
      const chars = normalized.split('');
      
      // Standard US format patterns found in our CSV: XXX-XXXX, XXX-XXX, XX#-### etc
      for (let i = 2; i <= chars.length - 1 && i <= 4; i++) {
        const part1 = chars.slice(0, i).join('');
        const part2 = chars.slice(i).join('');
        if (part2.length >= 1) {
          variations.add(`${part1}-${part2}`);
        }
      }
      
      // Also try with spaces (though CSV uses dashes)
      for (let i = 2; i <= chars.length - 1 && i <= 4; i++) {
        const part1 = chars.slice(0, i).join('');
        const part2 = chars.slice(i).join('');
        if (part2.length >= 1) {
          variations.add(`${part1} ${part2}`);
        }
      }
    }

    return Array.from(variations);
  }

  fuzzySearch(normalizedInput) {
    let bestMatch = null;
    let bestScore = 0;

    for (const [key, member] of this.searchIndex.normalized) {
      const similarity = this.calculateSimilarity(normalizedInput, key);
      if (similarity > 0.8 && similarity > bestScore) {
        bestMatch = member;
        bestScore = similarity;
      }
    }

    return bestMatch ? { 
      match: bestMatch, 
      confidence: Math.round(bestScore * 100) 
    } : null;
  }

  calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }

  isValidCarNumberFormat(input) {
    if (!input || typeof input !== 'string') return false;
    
    const normalized = this.normalizePlateNumber(input);
    
    if (normalized.length < 3 || normalized.length > 10) return false;
    
    const hasLetter = /[A-Z]/i.test(normalized);
    const hasNumber = /[0-9]/.test(normalized);
    
    return hasLetter && hasNumber;
  }

  // Security method to mask personal info
  maskPersonalInfo(memberData) {
    if (!memberData) return null;

    const firstName = memberData['First Name'] || '';
    const lastName = memberData['Last Name'] || '';
    const maskedLastName = lastName.length >= 2 
      ? lastName.substring(0, 2) + '*'.repeat(Math.max(0, lastName.length - 2))
      : lastName;

    return {
      displayName: `${firstName} ${maskedLastName}`,
      plateNumber: memberData['Plate Number'],
      manufacturer: memberData['Car Manufacturer'],
      carType: memberData['Car Type'],
      memberStatus: memberData.Member === 'Y' ? 'Active Member' : 'Non-Member'
    };
  }
}