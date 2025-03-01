import { Anthropic } from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { naturalLanguageRule, apiKey } = req.body;

    if (!naturalLanguageRule) {
      return res.status(400).json({ error: 'Natural language rule is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'Claude API key is required' });
    }

    // Initialize the Anthropic client with the provided API key
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Check if this is a real-time translation request
    const isRealtime = req.body.realtime === true;
    
    // Use a more lightweight model and instruction for real-time translations
    const model = isRealtime ? 'claude-3-haiku-20240307' : 'claude-3-7-sonnet-20250219';
    const temperature = isRealtime ? 0.2 : 0.3;
    
    // Translate the natural language rule to code
    const systemPrompt = `You are an expert system that translates natural language rule descriptions into structured rule code.
Your output should be valid JSON with a "rule" field containing the translated rule logic.`;

    const userPrompt = `Translate this into a rule expression using conditions and logical operators (and, or, not).
Use common fields like: 
- transaction.amount
- user.age
- user.country
- transaction.date
- location.state
- weekly_revenue
- monthly_revenue

For example:
"Flag transactions over $500 from new users" would translate to:
{
  "rule": "if transaction.amount > 500 and user.is_new == true then flag_transaction"
}

Provide ONLY the JSON output with no additional text or explanation.

Natural language rule to translate: "${naturalLanguageRule}"`;

    try {
      const response = await anthropic.messages.create({
        model: model,
        max_tokens: isRealtime ? 300 : 1000, // Shorter responses for real-time
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: temperature,
      });

      // Extract the JSON from the response content
      const content = response.content[0].text;
      
      try {
        // Try to parse the response as JSON
        const jsonMatch = content.match(/{[\s\S]*}/);
        if (jsonMatch) {
          return res.status(200).json(JSON.parse(jsonMatch[0]));
        } else {
          // If no JSON found, return the raw content
          return res.status(200).json({ rule: content.trim() });
        }
      } catch (parseError) {
        console.error('Error parsing Claude response as JSON:', parseError);
        return res.status(200).json({ rule: content.trim() });
      }
    } catch (apiError) {
      console.error('Error calling Claude API:', apiError);
      return res.status(500).json({ error: 'Failed to call Claude API: ' + apiError.message });
    }
  } catch (error) {
    console.error('Error translating rule:', error);
    return res.status(500).json({ error: 'Failed to translate rule: ' + error.message });
  }
}