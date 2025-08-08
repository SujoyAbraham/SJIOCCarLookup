/**
 * Enhanced Car Number Search Engine for React
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
      normalized: new Map(),
      patterns: new Map()
    };

    this.memberData.forEach(member => {
      const carNumber = member['Car Number'];
      if (!carNumber) return;

      // Exact match index
      index.exact.set(carNumber.toUpperCase(), member);

      // Normalized index (alphanumeric only)
      const normalized = this.normalizeCarNumber(carNumber);
      index.normalized.set(normalized, member);

      // Pattern variations
      this.generatePatterns(carNumber).forEach(pattern => {
        index.patterns.set(pattern, member);
      });
    });

    return index;
  }

  searchCarNumber(userInput) {
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

    // Strategy 2: Normalized match (90% confidence)
    const normalized = this.normalizeCarNumber(cleanInput);
    if (normalized.length >= 3 && normalized.length <= 10) {
      if (this.searchIndex.normalized.has(normalized)) {
        return {
          match: this.searchIndex.normalized.get(normalized),
          matchType: 'normalized',
          confidence: 90
        };
      }

      // Strategy 3: Pattern match (85% confidence)
      const patterns = this.generatePatterns(cleanInput);
      for (const pattern of patterns) {
        if (this.searchIndex.patterns.has(pattern)) {
          return {
            match: this.searchIndex.patterns.get(pattern),
            matchType: 'pattern',
            confidence: 85
          };
        }
      }

      // Strategy 4: Fuzzy match (80%+ confidence)
      const fuzzyResult = this.fuzzySearch(normalized);
      if (fuzzyResult) {
        return {
          match: fuzzyResult.match,
          matchType: 'fuzzy',
          confidence: fuzzyResult.confidence
        };
      }
    }

    return null;
  }

  normalizeCarNumber(carNumber) {
    return carNumber.replace(/[^A-Z0-9]/g, '');
  }

  generatePatterns(carNumber) {
    const patterns = new Set();
    const normalized = this.normalizeCarNumber(carNumber);
    
    patterns.add(carNumber.toUpperCase());
    patterns.add(normalized);

    if (normalized.length >= 6) {
      const chars = normalized.split('');
      
      // Common Indian formats
      if (chars.length === 7 && /^[A-Z]{3}[0-9]{4}$/.test(normalized)) {
        patterns.add(`${chars.slice(0, 3).join('')}-${chars.slice(3).join('')}`);
        patterns.add(`${chars.slice(0, 3).join('')} ${chars.slice(3).join('')}`);
      }

      if (chars.length === 10 && /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(normalized)) {
        patterns.add(`${chars.slice(0, 2).join('')}-${chars.slice(2, 4).join('')}-${chars.slice(4, 6).join('')}-${chars.slice(6).join('')}`);
        patterns.add(`${chars.slice(0, 2).join('')} ${chars.slice(2, 4).join('')} ${chars.slice(4, 6).join('')} ${chars.slice(6).join('')}`);
      }

      // Generic patterns
      for (let i = 2; i <= chars.length - 2; i++) {
        patterns.add(`${chars.slice(0, i).join('')}-${chars.slice(i).join('')}`);
        patterns.add(`${chars.slice(0, i).join('')} ${chars.slice(i).join('')}`);
      }
    }

    return Array.from(patterns);
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
    
    const normalized = this.normalizeCarNumber(input);
    
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
      carNumber: memberData['Car Number'],
      manufacturer: memberData['Car Manufacturer'],
      carType: memberData['Car Type'],
      memberStatus: memberData.Member === 'Y' ? 'Active Member' : 'Non-Member'
    };
  }
}