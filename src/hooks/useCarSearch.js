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

  // Get smart chunked CSV context for LLM queries
  const getContextForQuery = (query) => {
    if (!memberData || memberData.length === 0) return null;

    // Extract potential plate number from query
    const plateMatches = query.match(/\b[A-Z0-9]{2,6}[\s\-\/\.]*[A-Z0-9]{1,6}\b|\b[A-Z0-9]{3,10}\b/gi);
    let relevantRecords = [];
    
    if (plateMatches) {
      // Find records that might match the query
      plateMatches.forEach(match => {
        const normalized = match.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        const hasLetters = /[A-Z]/i.test(normalized);
        const hasNumbers = /[0-9]/.test(normalized);
        const isCommonWord = /^(WHO|OWNS|CAR|FIND|THE|OWNER|TELL|CAN|YOU|WHOSE|LOOKING|FOR|NUMBER|HELP|NEED|SAW|WITH|THERE|PLATE|BLOCKING|SHOW|ALL|LIST|MEMBERS|HAS|MOST|WHAT|DOES|DRIVE|HELLO|HOW|ARE|DO)$/i.test(normalized);
        
        if (hasLetters && hasNumbers && !isCommonWord && normalized.length >= 3) {
          // Find records with similar alphanumeric patterns
          const matchingRecords = memberData.filter(member => {
            const plateNumber = member['Plate Number'] || '';
            const plateNormalized = plateNumber.replace(/[^A-Z0-9]/g, '').toUpperCase();
            
            // Exact match or starts with the same characters
            return plateNormalized === normalized || 
                   plateNormalized.startsWith(normalized) ||
                   normalized.startsWith(plateNormalized) ||
                   plateNormalized.includes(normalized) ||
                   normalized.includes(plateNormalized);
          });
          
          relevantRecords.push(...matchingRecords);
        }
      });
    }
    
    // Remove duplicates and limit to top 10 most relevant
    const uniqueRecords = Array.from(new Set(relevantRecords.map(r => r['Plate Number'])))
      .map(plateNum => relevantRecords.find(r => r['Plate Number'] === plateNum))
      .slice(0, 10);
    
    // If no specific matches found, return alphabetically sorted sample
    if (uniqueRecords.length === 0) {
      const sortedData = [...memberData].sort((a, b) => 
        (a['Plate Number'] || '').localeCompare(b['Plate Number'] || '')
      );
      uniqueRecords.push(...sortedData.slice(0, 10));
    }
    
    // Format the relevant records
    const csvData = uniqueRecords.map(member => {
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
    
    return `SJIOC Vehicle Database (${totalMembers} total vehicles, ${activeMembers} active members):

Most relevant matches for your query:
${csvData}

[Note: If exact match not found above, plate number may not exist in database]`;
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