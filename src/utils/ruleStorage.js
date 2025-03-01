// Simple client-side rule storage utility
// For production, this would be replaced with a real database

// Rule structure:
// {
//   id: string,
//   name: string,
//   naturalLanguage: string,
//   ruleCode: string,
//   createdAt: Date,
//   updatedAt: Date,
//   versions: [{ ruleCode: string, timestamp: Date }]
// }

const STORAGE_KEY = 'ruleweave_rules';

// Get all rules
export const getAllRules = () => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  const storedRules = localStorage.getItem(STORAGE_KEY);
  return storedRules ? JSON.parse(storedRules) : [];
};

// Get a specific rule by ID
export const getRuleById = (id) => {
  const rules = getAllRules();
  return rules.find(rule => rule.id === id) || null;
};

// Save a new rule
export const saveRule = (rule) => {
  const rules = getAllRules();
  const now = new Date();
  
  const newRule = {
    ...rule,
    id: rule.id || `rule_${Date.now()}`,
    createdAt: rule.createdAt || now,
    updatedAt: now,
    versions: rule.versions || [{ ruleCode: rule.ruleCode, timestamp: now }]
  };
  
  // Check if rule already exists
  const existingRuleIndex = rules.findIndex(r => r.id === newRule.id);
  
  if (existingRuleIndex !== -1) {
    // Update existing rule and add a new version
    const existingRule = rules[existingRuleIndex];
    
    // Only add a new version if the rule code has changed
    if (existingRule.ruleCode !== newRule.ruleCode) {
      newRule.versions = [
        ...existingRule.versions,
        { ruleCode: newRule.ruleCode, timestamp: now }
      ];
    } else {
      newRule.versions = existingRule.versions;
    }
    
    // Update the rule in the array
    rules[existingRuleIndex] = newRule;
  } else {
    // Add the new rule
    rules.push(newRule);
  }
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  
  return newRule;
};

// Delete a rule
export const deleteRule = (id) => {
  const rules = getAllRules();
  const updatedRules = rules.filter(rule => rule.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRules));
  return true;
};

// Revert to a previous version
export const revertToVersion = (ruleId, versionIndex) => {
  const rules = getAllRules();
  const ruleIndex = rules.findIndex(rule => rule.id === ruleId);
  
  if (ruleIndex === -1) {
    return null;
  }
  
  const rule = rules[ruleIndex];
  
  if (!rule.versions || !rule.versions[versionIndex]) {
    return null;
  }
  
  const versionToRevert = rule.versions[versionIndex];
  const now = new Date();
  
  // Create a new version with the reverted code
  const updatedRule = {
    ...rule,
    ruleCode: versionToRevert.ruleCode,
    updatedAt: now,
    versions: [
      ...rule.versions,
      { 
        ruleCode: versionToRevert.ruleCode, 
        timestamp: now,
        isReversion: true,
        revertedFromVersion: versionIndex
      }
    ]
  };
  
  rules[ruleIndex] = updatedRule;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  
  return updatedRule;
};