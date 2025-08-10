import { motion } from 'framer-motion';

const SearchResult = ({ result, onClose }) => {
  if (!result) return null;

  const renderAIResponse = (response) => {
    // Convert markdown-style formatting to JSX
    const formatText = (text) => {
      return text
        .split('\n')
        .map((line, index) => {
          if (line.startsWith('🚗 **') && line.includes('**')) {
            return (
              <div key={index} className="text-xl font-bold text-gray-900 mb-3">
                {line.replace(/\*\*/g, '')}
              </div>
            );
          }
          if (line.startsWith('👤 **') || line.startsWith('🚙 **') || line.startsWith('📋 **')) {
            const cleanLine = line.replace(/\*\*/g, '');
            const [icon, ...rest] = cleanLine.split(' ');
            return (
              <div key={index} className="flex items-start gap-2 mb-2">
                <span className="text-lg">{icon}</span>
                <span className="font-medium text-gray-800">{rest.join(' ')}</span>
              </div>
            );
          }
          if (line.startsWith('📞')) {
            return (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-blue-800 text-sm">{line}</p>
              </div>
            );
          }
          if (line.startsWith('*Found via') || line.includes('confidence')) {
            return (
              <div key={index} className="text-xs text-gray-500 mt-2 italic">
                {line}
              </div>
            );
          }
          if (line.trim()) {
            return (
              <p key={index} className="text-gray-700 mb-2">
                {line}
              </p>
            );
          }
          return <br key={index} />;
        });
    };

    return <div className="space-y-1">{formatText(response)}</div>;
  };

  const renderLocalResult = (data, confidence, matchType) => {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 mb-2">
            🚗 {data.plateNumber}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">👤</span>
            <div>
              <span className="font-medium text-gray-800">Owner: </span>
              <span className="text-gray-700">{data.displayName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl">🚙</span>
            <div>
              <span className="font-medium text-gray-800">Vehicle: </span>
              <span className="text-gray-700">{data.manufacturer} {data.carType}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl">📋</span>
            <div>
              <span className="font-medium text-gray-800">Status: </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                data.memberStatus === 'Active Member' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {data.memberStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-sm">
            📞 Please contact the owner directly or connect with Trustee OR Secretary.
          </p>
        </div>

        {confidence < 100 && (
          <div className="text-xs text-gray-500 text-center italic">
            Found via {matchType} matching ({confidence}% confidence)
          </div>
        )}
      </div>
    );
  };

  const renderSymbolMismatch = (suggestions, userInput, customMessage) => {
    return (
      <div className="text-center space-y-4">
        <div className="text-6xl">⚠️</div>
        <div className="text-lg font-medium text-orange-700">
          {customMessage ? 'Exact Format Required' : 'Incorrect Symbol Format'}
        </div>
        <div className="text-gray-600">
          You searched for <strong className="text-gray-900">"{userInput}"</strong> but {customMessage || 'the correct format is'}:
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm">
            <strong className="text-orange-800">✅ Correct format:</strong>
            <div className="mt-2 space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="font-mono text-lg text-green-700 bg-green-50 px-3 py-2 rounded border">
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-800">
            <strong>💡 Symbol Rule:</strong> When using symbols like dashes (-), slashes (/), or dots (.), 
            they must match exactly as registered. Use spaces or no symbols for flexible search.
          </div>
        </div>
      </div>
    );
  };

  const renderNotFound = () => {
    return (
      <div className="text-center space-y-4">
        <div className="text-6xl">🔍</div>
        <div className="text-lg font-medium text-gray-700">
          No plate found
        </div>
        <div className="text-gray-600">
          Please check the plate number and try again
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-sm text-gray-600">
            <strong>💡 Try different formats:</strong>
            <div className="mt-1 space-y-1">
              <div>• Without symbols: ABC1234</div>
              <div>• With dashes: ABC-1234</div>
              <div>• With spaces: ABC 1234</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-church-primary to-church-secondary px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-white font-medium">
            {result.type === 'not_found' ? 'Search Result' : 'Car Found'}
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {result.type === 'ai_response' && renderAIResponse(result.response)}
        {result.type === 'local_result' && renderLocalResult(result.data, result.confidence, result.matchType)}
        {result.type === 'symbol_mismatch' && renderSymbolMismatch(result.suggestions, result.userInput)}
        {result.type === 'format_mismatch' && renderSymbolMismatch(result.suggestions, result.userInput, result.message)}
        {result.type === 'not_found' && renderNotFound()}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          🏛️ St. John's Indian Orthodox Church
        </div>
      </div>
    </motion.div>
  );
};

export default SearchResult;