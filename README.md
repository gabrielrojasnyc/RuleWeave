# RuleWeave

RuleWeave is an interactive web application that converts natural language rule descriptions into structured rule logic using Claude AI.

## Features

- Natural Language to Rule Code conversion
- Rule editing with Monaco Editor
- Real-time validation of rules
- Rule storage and version history
- Clean, minimalist UI

## Getting Started

### Prerequisites

- Node.js (version 14.x or higher)
- npm or yarn
- Claude API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ruleweave.git
cd ruleweave
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter your Claude API key in the input field at the top of the application
2. Name your rule
3. Write a rule description in natural language (e.g., "Flag transactions over $500 from new users")
4. Click "Translate to Rule" to convert it to structured rule logic
5. Edit the generated rule if needed
6. Validate the rule to check for syntax or logical errors
7. Save the rule for later use
8. Access version history to revert to previous versions if needed

## Example

Natural language input:
```
Select all franchises making over 1MM per week in Colorado and make less than 1MM in California
```

Generated rule:
```
if (location.state == 'Colorado' and weekly_revenue > 1000000) and (location.state == 'California' and weekly_revenue < 1000000) then select_franchise
```

## Technologies Used

- **Frontend**: React.js, Next.js, Tailwind CSS, Monaco Editor
- **Backend**: Next.js API routes
- **AI**: Claude API (Anthropic)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Powered by Claude from Anthropic