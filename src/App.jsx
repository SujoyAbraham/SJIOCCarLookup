import { useState, useEffect } from 'react';
import MobileApp from './components/MobileApp';

function App() {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    // Check if running in embedded mode (iframe)
    setIsEmbedded(window.self !== window.top);

    // Add mobile viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }

    // Set document title
    document.title = 'SJIOC Car Lookup';
  }, []);

  return (
    <div className={`app ${isEmbedded ? 'embedded' : 'standalone'}`}>
      <MobileApp />
    </div>
  );
}

export default App;