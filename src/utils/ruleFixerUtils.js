// This utility simulates auto-fixing of rule errors
// In a real-world implementation, this would use Claude API to suggest fixes

/**
 * Analyzes rule code and attempts to fix common syntax issues
 * @param {string} ruleCode - The rule code to fix
 * @param {Array} errors - List of validation errors
 * @returns {Object} - Object containing fixed rule and explanation
 */
export const autoFixRule = (ruleCode, errors = []) => {
  let fixedRule = ruleCode;
  let fixExplanations = [];
  let confidenceScore = 100;
  
  // Check for missing closing parenthesis
  if (countOccurrences(fixedRule, '(') > countOccurrences(fixedRule, ')')) {
    const missingCount = countOccurrences(fixedRule, '(') - countOccurrences(fixedRule, ')');
    fixedRule = fixedRule + ')'.repeat(missingCount);
    fixExplanations.push(`Added ${missingCount} missing closing parenthesis`);
    confidenceScore -= 5 * missingCount;
  }
  
  // Check for missing closing quotes
  if (countOccurrences(fixedRule, '"') % 2 !== 0) {
    fixedRule = fixedRule + '"';
    fixExplanations.push('Added missing closing quote');
    confidenceScore -= 5;
  }
  
  if (countOccurrences(fixedRule, "'") % 2 !== 0) {
    fixedRule = fixedRule + "'";
    fixExplanations.push("Added missing closing quote");
    confidenceScore -= 5;
  }
  
  // Fix missing 'then' keyword
  if (fixedRule.includes('if') && !fixedRule.includes('then') && fixedRule.includes('and')) {
    const ifIndex = fixedRule.indexOf('if');
    const lastAndIndex = fixedRule.lastIndexOf('and');
    const andEndIndex = lastAndIndex + 'and'.length;
    
    // Insert 'then' after the last condition
    const textAfterAnd = fixedRule.substring(andEndIndex);
    let insertIndex = andEndIndex;
    
    // Find the end of the condition after the last 'and'
    const nextOperatorIndex = Math.min(
      textAfterAnd.indexOf(' and ') === -1 ? Infinity : textAfterAnd.indexOf(' and '),
      textAfterAnd.indexOf(' or ') === -1 ? Infinity : textAfterAnd.indexOf(' or ')
    );
    
    if (nextOperatorIndex !== Infinity) {
      insertIndex += nextOperatorIndex;
    } else {
      // If no other operators, add 'then' at the end
      insertIndex = fixedRule.length;
    }
    
    fixedRule = fixedRule.substring(0, insertIndex) + ' then ' + fixedRule.substring(insertIndex);
    fixExplanations.push('Added missing "then" keyword after conditions');
    confidenceScore -= 10;
  }
  
  // Fix incomplete comparison operator
  const operators = ['>', '<', '>=', '<=', '==', '!='];
  for (const op of operators) {
    if (fixedRule.includes(op)) {
      const opIndex = fixedRule.indexOf(op);
      const afterOp = fixedRule.substring(opIndex + op.length).trim();
      
      // Check if there's no value after the operator
      if (!afterOp || afterOp.startsWith('and') || afterOp.startsWith('or') || afterOp.startsWith('then')) {
        const fixedAfterOp = afterOp.replace(/^(and|or|then)/, '');
        fixedRule = fixedRule.substring(0, opIndex + op.length) + ' 0 ' + fixedAfterOp;
        fixExplanations.push(`Added missing value after "${op}" operator`);
        confidenceScore -= 15;
      }
    }
  }
  
  // If fixing doesn't make sense, return the original
  if (fixExplanations.length === 0) {
    return { 
      fixedRule: ruleCode,
      fixExplanations: ['No automatic fixes applied'],
      confidenceScore: 0,
      wasFixed: false
    };
  }
  
  return {
    fixedRule,
    fixExplanations,
    confidenceScore,
    wasFixed: true
  };
};

/**
 * Count occurrences of a character in a string
 */
const countOccurrences = (str, char) => {
  return (str.match(new RegExp(char, 'g')) || []).length;
};