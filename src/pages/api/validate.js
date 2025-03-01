import { Anthropic } from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ruleCode, apiKey } = req.body;

    if (!ruleCode) {
      return res.status(400).json({ error: 'Rule code is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'Claude API key is required' });
    }

    // Initialize the Anthropic client with the provided API key
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Validate the rule code
    const systemPrompt = `You are a rule syntax validator. You analyze rule code and check for syntax errors or logical inconsistencies.`;
    
    const userPrompt = `Analyze the following rule code and check for syntax errors or logical inconsistencies:

${ruleCode}

Respond with a JSON object like this:
{
  "isValid": true or false,
  "errors": [] (an array of error messages if any),
  "suggestions": [] (an array of improvement suggestions if any)
}

ONLY return the JSON object with no additional text.`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
      });

      // Extract the JSON from the response content
      const content = response.content[0].text;
      
      try {
        // Try to parse the response as JSON
        const jsonMatch = content.match(/{[\s\S]*}/);
        if (jsonMatch) {
          return res.status(200).json(JSON.parse(jsonMatch[0]));
        } else {
          // If no JSON found, return an error
          return res.status(200).json({ 
            isValid: false, 
            errors: ['Could not validate rule format'], 
            suggestions: ['Check rule syntax and ensure it follows the expected format'] 
          });
        }
      } catch (parseError) {
        console.error('Error parsing Claude validation response as JSON:', parseError);
        return res.status(200).json({ 
          isValid: false, 
          errors: ['Failed to parse validation response'], 
          suggestions: ['Try simplifying the rule syntax'] 
        });
      }
    } catch (apiError) {
      console.error('Error calling Claude API:', apiError);
      return res.status(500).json({ error: 'Failed to call Claude API: ' + apiError.message });
    }
  } catch (error) {
    console.error('Error validating rule:', error);
    return res.status(500).json({ error: 'Failed to validate rule: ' + error.message });
  }
}