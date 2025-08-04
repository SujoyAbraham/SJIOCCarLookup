export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { message, memberData } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      });
      return;
    }

    // Check if asking for specific car number - provide targeted response
    const carNumberMatch = message.match(/\b(GJ-\d{2}-[A-Z]{2}-\d{4})\b/i);
    let contextData = memberData;
    
    // If car number mentioned, get specific data from member data
    if (carNumberMatch && memberData) {
      const carNumber = carNumberMatch[0].toUpperCase();
      // Note: This is handled client-side for privacy
      contextData = memberData;
    }

    const systemPrompt = `You are SJIOC Assistant, a friendly AI helper for the Saurashtra Jaguar Independent Owners Club. 

🎯 Your Role:
- Help with car-related questions and SJIOC information
- Be warm, engaging, and use appropriate emojis
- Keep responses concise but helpful (2-3 sentences max)

🔒 Privacy Rules:
- NEVER share personal details like names, addresses, or phone numbers
- Only share car information when asked about SPECIFIC car numbers (GJ-XX-XX-XXXX format)
- For general questions, provide helpful car advice without revealing member data
- If asked about "all members" or "list cars", politely decline and suggest asking about specific car numbers

📊 Available Data Context:
${contextData || 'General SJIOC information available'}

💬 Response Style:
- Start with an appropriate emoji
- Be conversational and friendly
- Offer to help with specific car numbers if relevant
- For car maintenance questions, provide helpful general advice`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-0125',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      res.status(response.status).json({ 
        success: false, 
        error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}` 
      });
      return;
    }

    const data = await response.json();
    
    res.status(200).json({
      success: true,
      response: data.choices[0].message.content
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}