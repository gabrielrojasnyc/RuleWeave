import React, { useState } from 'react';

// Template categories for organization
const CATEGORIES = {
  FRAUD: 'Fraud Detection',
  SECURITY: 'Security',
  MONITORING: 'Monitoring',
  COMPLIANCE: 'Compliance',
  PERFORMANCE: 'Performance',
  OTHER: 'Other'
};

// Pre-built template definitions
const TEMPLATES = [
  {
    id: 'high-value-transactions',
    name: 'High Value Transaction Alert',
    description: 'Flag transactions that exceed a specified threshold amount',
    category: CATEGORIES.FRAUD,
    naturalLanguage: 'Flag transactions where amount is greater than $1000',
    ruleCode: 'if transaction.amount > 1000 then flag_transaction',
    variables: [
      { name: 'threshold', label: 'Amount Threshold', type: 'number', defaultValue: 1000 }
    ]
  },
  {
    id: 'new-country-transactions',
    name: 'New Country Transaction',
    description: 'Alert on transactions from countries not previously seen for this user',
    category: CATEGORIES.FRAUD,
    naturalLanguage: 'Flag transactions where user country is not in their previously seen countries',
    ruleCode: 'if user.country not in user.previous_countries then flag_transaction',
    variables: []
  },
  {
    id: 'rapid-transactions',
    name: 'Rapid Successive Transactions',
    description: 'Detect multiple transactions in a short timeframe',
    category: CATEGORIES.FRAUD,
    naturalLanguage: 'Flag if more than 3 transactions occur within 5 minutes',
    ruleCode: 'if transaction.count > 3 and transaction.timeframe < 5 then flag_transaction',
    variables: [
      { name: 'count', label: 'Transaction Count', type: 'number', defaultValue: 3 },
      { name: 'minutes', label: 'Time Window (minutes)', type: 'number', defaultValue: 5 }
    ]
  },
  {
    id: 'high-risk-country',
    name: 'High Risk Country',
    description: 'Flag transactions from countries designated as high risk',
    category: CATEGORIES.COMPLIANCE,
    naturalLanguage: 'Flag transactions where user country is in the high risk country list',
    ruleCode: 'if user.country in ["Country1", "Country2", "Country3"] then flag_transaction',
    variables: [
      { name: 'countries', label: 'High Risk Countries', type: 'array', defaultValue: ["Country1", "Country2", "Country3"] }
    ]
  },
  {
    id: 'revenue-threshold',
    name: 'Revenue Threshold Alert',
    description: 'Monitor when weekly revenue exceeds a specified threshold',
    category: CATEGORIES.MONITORING,
    naturalLanguage: 'Alert when weekly revenue exceeds $50,000',
    ruleCode: 'if weekly_revenue > 50000 then send_alert',
    variables: [
      { name: 'threshold', label: 'Revenue Threshold', type: 'number', defaultValue: 50000 }
    ]
  },
  {
    id: 'unusual-activity',
    name: 'Unusual Activity Pattern',
    description: 'Detect activity patterns that deviate from user\'s normal behavior',
    category: CATEGORIES.SECURITY,
    naturalLanguage: 'Flag if user activity level is greater than 200% of their average activity',
    ruleCode: 'if user.activity_level > user.average_activity * 2 then flag_suspicious_activity',
    variables: [
      { name: 'multiplier', label: 'Activity Multiplier', type: 'number', defaultValue: 2 }
    ]
  },
  {
    id: 'location-mismatch',
    name: 'Location Mismatch',
    description: 'Alert when user location doesn\'t match their registered address',
    category: CATEGORIES.SECURITY,
    naturalLanguage: 'Flag transactions where user location state is not equal to their registered state',
    ruleCode: 'if location.state != user.registered_state then flag_transaction',
    variables: []
  },
  {
    id: 'performance-degradation',
    name: 'Performance Degradation',
    description: 'Monitor for system performance issues',
    category: CATEGORIES.PERFORMANCE,
    naturalLanguage: 'Alert when response time is greater than 500ms for more than 5 minutes',
    ruleCode: 'if system.response_time > 500 and condition.duration > 5 then send_performance_alert',
    variables: [
      { name: 'responseTime', label: 'Response Time (ms)', type: 'number', defaultValue: 500 },
      { name: 'duration', label: 'Duration (minutes)', type: 'number', defaultValue: 5 }
    ]
  }
];

const TemplatesGallery = ({ onSelectTemplate, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizedValues, setCustomizedValues] = useState({});

  // Filter templates based on search query and active category
  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group templates by category
  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {});

  // Handle template selection
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    
    // Initialize customized values with default values
    const initialValues = {};
    template.variables.forEach(variable => {
      initialValues[variable.name] = variable.defaultValue;
    });
    
    setCustomizedValues(initialValues);
  };

  // Handle variable value change
  const handleVariableChange = (variableName, value) => {
    setCustomizedValues(prev => ({
      ...prev,
      [variableName]: value
    }));
  };

  // Apply the customized values to the template
  const applyCustomizedTemplate = () => {
    if (!selectedTemplate) return;
    
    let customizedRuleCode = selectedTemplate.ruleCode;
    let customizedNaturalLanguage = selectedTemplate.naturalLanguage;
    
    // Replace variables in the rule code and natural language
    selectedTemplate.variables.forEach(variable => {
      const value = customizedValues[variable.name];
      
      // Replace variables in rule code
      let valueStr = Array.isArray(value) 
        ? `[${value.map(v => typeof v === 'string' ? `"${v}"` : v).join(', ')}]`
        : typeof value === 'string' ? `"${value}"` : value;
      
      // Simple replacement - in a real app, you'd want more sophisticated variable substitution
      customizedRuleCode = customizedRuleCode.replace(
        new RegExp(variable.defaultValue instanceof Array ? 
          variable.defaultValue.map(v => typeof v === 'string' ? `"${v}"` : v).join(', ') :
          variable.defaultValue, 'g'), 
        valueStr
      );
      
      // Replace in natural language too
      customizedNaturalLanguage = customizedNaturalLanguage.replace(
        new RegExp(variable.defaultValue, 'g'), 
        value
      );
    });
    
    // Send the customized template back to the parent component
    onSelectTemplate({
      name: selectedTemplate.name,
      naturalLanguage: customizedNaturalLanguage,
      ruleCode: customizedRuleCode
    });
    
    onClose();
  };

  // Render the template customization view
  const renderTemplateCustomization = () => {
    if (!selectedTemplate) return null;
    
    return (
      <div className="p-4">
        <button 
          onClick={() => setSelectedTemplate(null)}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to templates
        </button>
        
        <h2 className="text-xl font-semibold mb-2">{selectedTemplate.name}</h2>
        <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Template Preview</h3>
          <div className="bg-gray-50 p-3 rounded-md mb-2">
            <div className="text-sm text-gray-500 mb-1">Rule:</div>
            <div className="font-mono text-sm">{selectedTemplate.ruleCode}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-500 mb-1">Natural Language:</div>
            <div>{selectedTemplate.naturalLanguage}</div>
          </div>
        </div>
        
        {selectedTemplate.variables.length > 0 ? (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Customize Template</h3>
            
            {selectedTemplate.variables.map(variable => (
              <div key={variable.name} className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {variable.label}
                </label>
                
                {variable.type === 'number' && (
                  <input
                    type="number"
                    value={customizedValues[variable.name]}
                    onChange={(e) => handleVariableChange(variable.name, parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                )}
                
                {variable.type === 'string' && (
                  <input
                    type="text"
                    value={customizedValues[variable.name]}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                )}
                
                {variable.type === 'array' && (
                  <input
                    type="text"
                    value={customizedValues[variable.name].join(', ')}
                    onChange={(e) => handleVariableChange(
                      variable.name, 
                      e.target.value.split(',').map(item => item.trim())
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Value1, Value2, Value3"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic mb-6">This template has no customizable variables.</p>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={applyCustomizedTemplate}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Use This Template
          </button>
        </div>
      </div>
    );
  };

  // Render the templates gallery view
  const renderTemplatesGallery = () => {
    return (
      <>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Templates Gallery</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex overflow-x-auto pb-2 mb-2 gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                activeCategory === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            
            {Object.values(CATEGORIES).map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === category 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          {Object.keys(templatesByCategory).length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No templates found matching your criteria
            </div>
          ) : (
            Object.entries(templatesByCategory).map(([category, templates]) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-medium mb-3">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map(template => (
                    <div 
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
                    >
                      <h4 className="font-medium mb-1">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="text-xs text-gray-500">
                        {template.variables.length > 0 ? (
                          <span>{template.variables.length} customizable {template.variables.length === 1 ? 'variable' : 'variables'}</span>
                        ) : (
                          <span>No customization needed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        {selectedTemplate ? renderTemplateCustomization() : renderTemplatesGallery()}
      </div>
    </div>
  );
};

export default TemplatesGallery;