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
        
        // In development, use CSV directly; in production, try API first
        let data;
        const isDev = import.meta.env.DEV;
        
        if (isDev) {
          // Development: Load CSV directly
          const response = await fetch('/members_data.csv');
          const csvText = await response.text();
          data = parseCSV(csvText);
        } else {
          // Production: Try API first, fallback to CSV
          let response = await fetch('/api/members');
          
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
  const searchPlateNumber = useCallback(async (query, useAPI = true) => {
    if (!query?.trim()) return null;

    try {
      // Step 1: Try LLM first with full CSV context (if API available)
      if (useAPI) {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: query,
              memberData: getContextForQuery(query) // Send full CSV data
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
        } catch (apiError) {
          console.log('API unavailable, falling back to local search');
        }
      }

      // Step 2: Fallback to local search if LLM fails
      if (searchEngine) {
        const searchResult = searchEngine.searchPlateNumber(query);
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

  // Get full CSV context for LLM queries
  const getContextForQuery = (query) => {
    if (!memberData || memberData.length === 0) return null;

    // Send the complete CSV data to LLM for matching
    // Format as a readable list for the LLM to search through
    const csvData = memberData.map(member => {
      const firstName = member['First Name'] || '';
      const lastName = member['Last Name'] || '';
      const plateNumber = member['Plate Number'] || '';
      const manufacturer = member['Car Manufacturer'] || '';
      const carType = member['Car Type'] || '';
      const memberStatus = member.Member === 'Y' ? 'Active Member' : 'Non-Member';
      
      return `${plateNumber}: ${firstName} ${lastName}, ${manufacturer} ${carType} - ${memberStatus}`;
    }).join('\n');

    const totalMembers = memberData.length;
    const activeMembers = memberData.filter(m => m.Member === 'Y').length;
    
    return `SJIOC Vehicle Database (${totalMembers} vehicles, ${activeMembers} active members):

${csvData}`;
  };

  // Get search suggestions
  const getSearchSuggestions = useCallback((partialInput) => {
    if (!searchEngine || !partialInput || partialInput.length < 2) return [];

    const normalized = partialInput.replace(/[^A-Z0-9]/g, '').toUpperCase();
    const suggestions = [];

    for (const member of memberData) {
      const carNumber = member['Plate Number'] || '';
      const normalizedCarNumber = carNumber.replace(/[^A-Z0-9]/g, '');
      
      if (normalizedCarNumber.startsWith(normalized) && suggestions.length < 5) {
        const maskedInfo = searchEngine.maskPersonalInfo(member);
        suggestions.push({
          plateNumber: carNumber,
          displayText: `${carNumber} - ${maskedInfo.displayName}`,
          vehicle: `${member['Car Manufacturer']} ${member['Car Type']}`
        });
      }
    }

    return suggestions;
  }, [searchEngine, memberData]);

  return {
    searchPlateNumber,
    getSearchSuggestions,
    loading,
    error,
    memberData,
    totalMembers: memberData.length,
    activeMembers: memberData.filter(m => m.Member === 'Y').length
  };
};