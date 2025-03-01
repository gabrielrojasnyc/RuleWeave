import { Anthropic } from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, apiKey } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'Claude API key is required' });
    }

    // Initialize the Anthropic client with the provided API key
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Create a prompt to analyze the partial rule and generate suggestions
    const systemPrompt = `You are an AI assistant that helps users write rules for a rule engine.
Your task is to analyze the user's partial rule text and suggest relevant entities, conditions, actions, or values they might want to include next.
You should return suggestions in JSON format.`;

    const userPrompt = `Here's a partial rule the user is writing:
"${text}"

Based on this partial text, provide suggestions for what they might want to add next.
Consider suggesting:
- Entities (like transaction.amount, user.age, user.country, transaction.date, location.state, weekly_revenue, etc.)
- Conditions (like greater than, less than, equal to, not equal to, contains, etc.)
- Actions (like flag, block, approve, review, etc.)
- Values (specific amounts, countries, states, etc. that make sense in context)

Return ONLY a JSON array of suggestions in this format:
{
  "suggestions": [
    {
      "text": "transaction.amount",
      "category": "entity",
      "description": "The monetary value of the transaction"
    },
    {
      "text": "greater than",
      "category": "condition",
      "description": "Checks if a value exceeds a threshold"
    }
  ]
}

Limit to 5 most relevant suggestions. Ensure they make semantic sense with what the user has already typed.`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
      });

      // Parse the JSON response
      const content = response.content[0].text;
      
      try {
        // Extract JSON from the response
        const jsonMatch = content.match(/{[\s\S]*}/);
        if (jsonMatch) {
          const suggestions = JSON.parse(jsonMatch[0]);
          return res.status(200).json(suggestions);
        } else {
          return res.status(200).json({ suggestions: [] });
        }
      } catch (parseError) {
        console.error('Error parsing Claude response as JSON:', parseError);
        return res.status(200).json({ suggestions: [] });
      }
    } catch (apiError) {
      console.error('Error calling Claude API:', apiError);
      return res.status(500).json({ error: 'Failed to call Claude API: ' + apiError.message });
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return res.status(500).json({ error: 'Failed to generate suggestions: ' + error.message });
  }
}