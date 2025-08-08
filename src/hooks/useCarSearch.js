import { useState, useEffect, useCallback } from 'react';
import { SecureCarSearchEngine } from '../utils/carSearchEngine.js';

export const useCarSearch = () => {
  const [memberData, setMemberData] = useState([]);
  const [searchEngine, setSearchEngine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load member data
  useEffect(() => {
    const loadMemberData = async () => {
      try {
        setLoading(true);
        
        // Try API first, fallback to CSV
        let response = await fetch('/api/members');
        let data;

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            data = result.data;
          } else {
            throw new Error('API failed');
          }
        } else {
          // Fallback to CSV
          response = await fetch('/members_data.csv');
          const csvText = await response.text();
          data = parseCSV(csvText);
        }

        setMemberData(data);
        
        // Initialize search engine with loaded data
        const engine = new SecureCarSearchEngine(data);
        setSearchEngine(engine);
        
      } catch (err) {
        console.error('Error loading member data:', err);
        setError('Failed to load member data');
      } finally {
        setLoading(false);
      }
    };

    loadMemberData();
  }, []);

  // CSV parser function
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const member = {};
      headers.forEach((header, index) => {
        member[header] = values[index] || '';
      });
      return member;
    });
  };

  // Search function with security
  const searchCarNumber = useCallback(async (query, useAPI = true) => {
    if (!query?.trim()) return null;

    try {
      // Try API first for enhanced security and LLM integration
      if (useAPI) {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: query,
            memberData: searchEngine ? getContextForQuery(query) : null
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            return {
              type: 'ai_response',
              response: result.response,
              source: 'api'
            };
          }
        }
      }

      // Fallback to local search
      if (searchEngine) {
        const searchResult = searchEngine.searchCarNumber(query);
        if (searchResult && searchResult.confidence >= 80) {
          const maskedInfo = searchEngine.maskPersonalInfo(searchResult.match);
          return {
            type: 'local_result',
            data: maskedInfo,
            confidence: searchResult.confidence,
            matchType: searchResult.matchType,
            source: 'local'
          };
        }
      }

      return null;
    } catch (err) {
      console.error('Search error:', err);
      return null;
    }
  }, [searchEngine]);

  // Get context for API queries
  const getContextForQuery = (query) => {
    if (!searchEngine) return null;

    const searchResult = searchEngine.searchCarNumber(query);
    if (searchResult && searchResult.confidence >= 85) {
      const member = searchResult.match;
      const firstName = member['First Name'] || '';
      const lastName = member['Last Name'] || '';
      const maskedLastName = lastName.length >= 2 
        ? lastName.substring(0, 2) + '*'.repeat(Math.max(0, lastName.length - 2))
        : lastName;
      
      return `Car ${member['Car Number']}: Owner ${firstName} ${maskedLastName}, ${member['Car Manufacturer']} ${member['Car Type']} - ${member.Member === 'Y' ? 'Active Member' : 'Non-Member'}`;
    }

    // Return general context
    const totalMembers = memberData.length;
    const activeMembers = memberData.filter(m => m.Member === 'Y').length;
    return `St. John's Indian Orthodox Church (SJIOC) has ${totalMembers} registered vehicles with ${activeMembers} active members.`;
  };

  // Get search suggestions
  const getSearchSuggestions = useCallback((partialInput) => {
    if (!searchEngine || !partialInput || partialInput.length < 2) return [];

    const normalized = partialInput.replace(/[^A-Z0-9]/g, '').toUpperCase();
    const suggestions = [];

    for (const member of memberData) {
      const carNumber = member['Car Number'] || '';
      const normalizedCarNumber = carNumber.replace(/[^A-Z0-9]/g, '');
      
      if (normalizedCarNumber.startsWith(normalized) && suggestions.length < 5) {
        const maskedInfo = searchEngine.maskPersonalInfo(member);
        suggestions.push({
          carNumber: carNumber,
          displayText: `${carNumber} - ${maskedInfo.displayName}`,
          vehicle: `${member['Car Manufacturer']} ${member['Car Type']}`
        });
      }
    }

    return suggestions;
  }, [searchEngine, memberData]);

  return {
    searchCarNumber,
    getSearchSuggestions,
    loading,
    error,
    memberData,
    totalMembers: memberData.length,
    activeMembers: memberData.filter(m => m.Member === 'Y').length
  };
};