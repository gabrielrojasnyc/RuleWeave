import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

// Rule component types
const COMPONENT_TYPES = {
  SUBJECT: 'subject',
  CONDITION: 'condition',
  VALUE: 'value',
  CONNECTOR: 'connector'
};

// Available rule components
const ruleComponents = {
  subjects: [
    { id: 'transaction.amount', type: COMPONENT_TYPES.SUBJECT, label: 'Transaction Amount' },
    { id: 'user.age', type: COMPONENT_TYPES.SUBJECT, label: 'User Age' },
    { id: 'user.country', type: COMPONENT_TYPES.SUBJECT, label: 'User Country' },
    { id: 'user.is_new', type: COMPONENT_TYPES.SUBJECT, label: 'Is New User' },
    { id: 'transaction.date', type: COMPONENT_TYPES.SUBJECT, label: 'Transaction Date' },
    { id: 'location.state', type: COMPONENT_TYPES.SUBJECT, label: 'Location State' },
    { id: 'weekly_revenue', type: COMPONENT_TYPES.SUBJECT, label: 'Weekly Revenue' },
    { id: 'monthly_revenue', type: COMPONENT_TYPES.SUBJECT, label: 'Monthly Revenue' }
  ],
  conditions: [
    { id: 'greater_than', type: COMPONENT_TYPES.CONDITION, label: '>' },
    { id: 'less_than', type: COMPONENT_TYPES.CONDITION, label: '<' },
    { id: 'equal_to', type: COMPONENT_TYPES.CONDITION, label: '==' },
    { id: 'not_equal_to', type: COMPONENT_TYPES.CONDITION, label: '!=' },
    { id: 'contains', type: COMPONENT_TYPES.CONDITION, label: 'contains' },
    { id: 'not_contains', type: COMPONENT_TYPES.CONDITION, label: 'does not contain' },
    { id: 'in', type: COMPONENT_TYPES.CONDITION, label: 'in' },
    { id: 'not_in', type: COMPONENT_TYPES.CONDITION, label: 'not in' }
  ],
  connectors: [
    { id: 'and', type: COMPONENT_TYPES.CONNECTOR, label: 'AND' },
    { id: 'or', type: COMPONENT_TYPES.CONNECTOR, label: 'OR' },
    { id: 'not', type: COMPONENT_TYPES.CONNECTOR, label: 'NOT' }
  ]
};

// Draggable component
const DraggableComponent = ({ component, isTemplate = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 9999 : 1
  };

  // Descriptions for tooltips based on component type and ID
  const getDescription = () => {
    const id = component.id.split('_')[0]; // Strip timestamp suffix
    
    switch (component.type) {
      case COMPONENT_TYPES.SUBJECT:
        switch (id) {
          case 'transaction.amount': return 'The monetary value of the transaction';
          case 'user.age': return 'Age of the user in years';
          case 'user.country': return 'Country code where user is located';
          case 'user.is_new': return 'Boolean indicating if user is new';
          case 'weekly_revenue': return 'Total revenue for the current week';
          default: return `${component.label} field`;
        }
      case COMPONENT_TYPES.CONDITION:
        switch (id) {
          case 'greater_than': return 'Left value is greater than right value';
          case 'less_than': return 'Left value is less than right value';
          case 'equal_to': return 'Left value equals right value';
          case 'contains': return 'Left string contains right value';
          default: return `${component.label} condition`;
        }
      case COMPONENT_TYPES.CONNECTOR:
        switch (id) {
          case 'and': return 'Both conditions must be true';
          case 'or': return 'Either condition can be true';
          case 'not': return 'Negates the following condition';
          default: return `${component.label} operator`;
        }
      default:
        return component.label;
    }
  };

  const baseCssClass = `px-3 py-2 rounded-lg shadow-sm cursor-move select-none font-medium text-sm transition-all duration-150 ${getComponentClass(component.type)}`;
  const cssClass = isTemplate ? 
    `${baseCssClass} hover:shadow-md hover:scale-105 active:scale-95` :
    `${baseCssClass}`;

  return (
    <Tooltip text={getDescription()}>
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cssClass}
        whileHover={{ scale: isTemplate ? 1.05 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <div className="flex items-center">
          {getComponentIcon(component.type)}
          {component.label}
        </div>
      </motion.div>
    </Tooltip>
  );
};

// Helper to get component styling based on type
const getComponentClass = (type) => {
  switch (type) {
    case COMPONENT_TYPES.SUBJECT:
      return 'bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-300 text-cyan-800 shadow-sm';
    case COMPONENT_TYPES.CONDITION:
      return 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-300 text-amber-800 shadow-sm';
    case COMPONENT_TYPES.VALUE:
      return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-300 text-emerald-800 shadow-sm';
    case COMPONENT_TYPES.CONNECTOR:
      return 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 text-purple-800 shadow-sm';
    default:
      return 'bg-gray-100 border border-gray-300 shadow-sm';
  }
};

// Helper to get component icon based on type
const getComponentIcon = (type) => {
  switch (type) {
    case COMPONENT_TYPES.SUBJECT:
      return (
        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
        </svg>
      );
    case COMPONENT_TYPES.CONDITION:
      return (
        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l4-4m0 0l4 4m-4-4v18"></path>
        </svg>
      );
    case COMPONENT_TYPES.VALUE:
      return (
        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
        </svg>
      );
    case COMPONENT_TYPES.CONNECTOR:
      return (
        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 21H5v-6l2.257-2.257A6 6 0 1121 9z"></path>
        </svg>
      );
    default:
      return null;
  }
};

// Tooltip component
const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow-sm whitespace-nowrap"
          >
            {text}
            <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Value input component
const ValueInput = ({ value, onChange, onAdd }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      onAdd();
      e.preventDefault();
    }
  };
  
  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
          </svg>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a value (number, text, date, etc.)"
          className="pl-10 pr-3 py-2.5 w-full border border-slate-200 shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-slate-400">
          Press Enter to add
        </div>
      </div>
      <motion.button
        onClick={onAdd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={!value.trim()}
        className={`px-4 py-2.5 rounded-lg shadow-sm font-medium text-sm ${
          value.trim() 
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700' 
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Value
        </div>
      </motion.button>
    </div>
  );
};

// Main Visual Rule Builder component
const VisualRuleBuilder = ({ onRuleChange }) => {
  const [activeId, setActiveId] = useState(null);
  const [ruleCanvas, setRuleCanvas] = useState([]);
  const [currentValueInput, setCurrentValueInput] = useState('');
  const [naturalLanguageRule, setNaturalLanguageRule] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Function to add a value component
  const handleAddValue = () => {
    if (!currentValueInput.trim()) return;

    const valueComponent = {
      id: `value_${Date.now()}`,
      type: COMPONENT_TYPES.VALUE,
      label: currentValueInput,
      value: currentValueInput
    };

    setRuleCanvas([...ruleCanvas, valueComponent]);
    setCurrentValueInput('');
  };

  // Function to handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Handle moving items within canvas
      if (ruleCanvas.some(item => item.id === active.id)) {
        const oldIndex = ruleCanvas.findIndex(item => item.id === active.id);
        const newIndex = ruleCanvas.findIndex(item => item.id === over.id);
        
        const newCanvas = [...ruleCanvas];
        const [movedItem] = newCanvas.splice(oldIndex, 1);
        newCanvas.splice(newIndex, 0, movedItem);
        
        setRuleCanvas(newCanvas);
      } else {
        // Handle adding new items to canvas
        const draggedComponent = [
          ...ruleComponents.subjects,
          ...ruleComponents.conditions,
          ...ruleComponents.connectors
        ].find(item => item.id === active.id);
        
        if (draggedComponent) {
          const newIndex = ruleCanvas.findIndex(item => item.id === over.id);
          const newCanvas = [...ruleCanvas];
          newCanvas.splice(newIndex, 0, { ...draggedComponent, id: `${draggedComponent.id}_${Date.now()}` });
          
          setRuleCanvas(newCanvas);
        }
      }
    } else if (!over && !ruleCanvas.some(item => item.id === active.id)) {
      // Add to the end if dropping on canvas but not over another item
      const draggedComponent = [
        ...ruleComponents.subjects,
        ...ruleComponents.conditions,
        ...ruleComponents.connectors
      ].find(item => item.id === active.id);
      
      if (draggedComponent) {
        setRuleCanvas([...ruleCanvas, { ...draggedComponent, id: `${draggedComponent.id}_${Date.now()}` }]);
      }
    }
    
    setActiveId(null);
  };

  // Function to remove item from canvas
  const handleRemoveItem = (id) => {
    setRuleCanvas(ruleCanvas.filter(item => item.id !== id));
  };

  // Function to clear the canvas
  const handleClearCanvas = () => {
    if (ruleCanvas.length > 0 && window.confirm('Are you sure you want to clear the rule canvas?')) {
      setRuleCanvas([]);
    }
  };

  // Generate natural language rule
  useEffect(() => {
    if (ruleCanvas.length === 0) {
      setNaturalLanguageRule('');
      setGeneratedCode('');
      return;
    }

    try {
      // Simple parsing to generate natural language
      let rule = '';
      
      for (let i = 0; i < ruleCanvas.length; i++) {
        const component = ruleCanvas[i];
        
        // Add spaces between components
        if (i > 0) rule += ' ';
        
        // Add component based on type
        if (component.type === COMPONENT_TYPES.SUBJECT) {
          rule += component.label;
        } else if (component.type === COMPONENT_TYPES.CONDITION) {
          rule += `is ${component.label}`;
        } else if (component.type === COMPONENT_TYPES.VALUE) {
          rule += component.value;
        } else if (component.type === COMPONENT_TYPES.CONNECTOR) {
          rule += component.label;
        }
      }
      
      setNaturalLanguageRule(rule);

      // Generate code from the rule components
      let code = '';
      for (let i = 0; i < ruleCanvas.length; i++) {
        const component = ruleCanvas[i];
        const originalId = component.id.split('_')[0]; // Strip timestamp suffix
        
        // Add component based on type
        if (component.type === COMPONENT_TYPES.SUBJECT) {
          code += originalId;
        } else if (component.type === COMPONENT_TYPES.CONDITION) {
          switch (originalId) {
            case 'greater_than': code += ' > '; break;
            case 'less_than': code += ' < '; break;
            case 'equal_to': code += ' == '; break;
            case 'not_equal_to': code += ' != '; break;
            case 'contains': code += '.includes('; break;
            case 'not_contains': code += '.indexOf('; break;
            case 'in': code += ' in '; break;
            case 'not_in': code += ' not in '; break;
          }
        } else if (component.type === COMPONENT_TYPES.VALUE) {
          // Add quotes for string values if not numeric
          const isNumeric = !isNaN(component.value) && !isNaN(parseFloat(component.value));
          code += isNumeric ? component.value : `"${component.value}"`;
          
          // Close parentheses for contains/not_contains
          const prevComponent = i > 0 ? ruleCanvas[i-1] : null;
          if (prevComponent && prevComponent.type === COMPONENT_TYPES.CONDITION) {
            const originalPrevId = prevComponent.id.split('_')[0];
            if (originalPrevId === 'contains') {
              code += ')';
            } else if (originalPrevId === 'not_contains') {
              code += ') === -1';
            }
          }
        } else if (component.type === COMPONENT_TYPES.CONNECTOR) {
          switch (originalId) {
            case 'and': code += ' && '; break;
            case 'or': code += ' || '; break;
            case 'not': code += '!'; break;
          }
        }
      }
      
      setGeneratedCode(code);
      if (onRuleChange) {
        onRuleChange(code, rule);
      }
    } catch (error) {
      console.error('Error generating rule:', error);
    }
  }, [ruleCanvas, onRuleChange]);

  // Function to handle drag start
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Find active component for drag overlay
  const getActiveComponent = () => {
    // Check if it's from the canvas
    const canvasItem = ruleCanvas.find(item => item.id === activeId);
    if (canvasItem) return canvasItem;

    // Check if it's from the component palettes
    return [
      ...ruleComponents.subjects,
      ...ruleComponents.conditions,
      ...ruleComponents.connectors
    ].find(item => item.id === activeId);
  };

  return (
    <div className="card animate-fade-in">
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-white border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
            </svg>
            Visual Rule Builder
          </h2>
          
          {ruleCanvas.length > 0 && (
            <motion.button
              onClick={handleClearCanvas}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded-full flex items-center transition-colors duration-150"
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Clear Canvas
            </motion.button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Components */}
            <div className="lg:col-span-3 space-y-6">
              {/* Component Types Accordion */}
              <div className="space-y-4">
                {/* Subjects */}
                <motion.div 
                  className="card-hover rounded-xl overflow-hidden border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="bg-gradient-to-r from-cyan-50 to-white p-3 border-b border-slate-100">
                    <h3 className="text-sm font-medium text-slate-800 flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                      Subjects
                    </h3>
                  </div>
                  <div className="p-3 grid grid-cols-1 gap-2 bg-white">
                    {ruleComponents.subjects.map(subject => (
                      <DraggableComponent key={subject.id} component={subject} isTemplate={true} />
                    ))}
                  </div>
                </motion.div>
                
                {/* Conditions */}
                <motion.div 
                  className="card-hover rounded-xl overflow-hidden border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-gradient-to-r from-amber-50 to-white p-3 border-b border-slate-100">
                    <h3 className="text-sm font-medium text-slate-800 flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7l4-4m0 0l4 4m-4-4v18"></path>
                      </svg>
                      Conditions
                    </h3>
                  </div>
                  <div className="p-3 grid grid-cols-1 gap-2 bg-white">
                    {ruleComponents.conditions.map(condition => (
                      <DraggableComponent key={condition.id} component={condition} isTemplate={true} />
                    ))}
                  </div>
                </motion.div>
                
                {/* Logical Operators */}
                <motion.div 
                  className="card-hover rounded-xl overflow-hidden border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-gradient-to-r from-purple-50 to-white p-3 border-b border-slate-100">
                    <h3 className="text-sm font-medium text-slate-800 flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 21H5v-6l2.257-2.257A6 6 0 1121 9z"></path>
                      </svg>
                      Logical Operators
                    </h3>
                  </div>
                  <div className="p-3 grid grid-cols-1 gap-2 bg-white">
                    {ruleComponents.connectors.map(connector => (
                      <DraggableComponent key={connector.id} component={connector} isTemplate={true} />
                    ))}
                  </div>
                </motion.div>
                
                {/* Value Input */}
                <motion.div 
                  className="card-hover rounded-xl overflow-hidden border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-gradient-to-r from-emerald-50 to-white p-3 border-b border-slate-100">
                    <h3 className="text-sm font-medium text-slate-800 flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                      </svg>
                      Custom Values
                    </h3>
                  </div>
                  <div className="p-3 bg-white">
                    <ValueInput
                      value={currentValueInput}
                      onChange={setCurrentValueInput}
                      onAdd={handleAddValue}
                    />
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Right Column - Canvas & Results */}
            <div className="lg:col-span-9 space-y-6">
              {/* Rule Canvas */}
              <motion.div 
                className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl p-6 min-h-[200px] relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                layout
              >
                <h3 className="text-sm font-medium text-slate-700 mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                  Rule Canvas
                  <span className="ml-2 text-xs text-slate-500 font-normal">
                    (Drag and drop components to build your rule)
                  </span>
                </h3>
                
                <AnimatePresence>
                  {ruleCanvas.length === 0 ? (
                    <motion.div 
                      className="flex flex-col items-center justify-center py-10 text-slate-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <svg className="w-12 h-12 mb-3 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                      <p className="font-medium">Drag components here from the left panel</p>
                      <p className="text-sm mt-1">Start by adding a subject (like "transaction.amount")</p>
                    </motion.div>
                  ) : (
                    <SortableContext items={ruleCanvas.map(item => item.id)} strategy={rectSortingStrategy}>
                      <motion.div 
                        className="flex flex-wrap gap-3 items-center"
                        layout
                      >
                        {ruleCanvas.map((item, index) => (
                          <motion.div 
                            key={item.id} 
                            className="relative group"
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', damping: 15 }}
                          >
                            <DraggableComponent component={item} />
                            
                            {/* Connector line */}
                            {index < ruleCanvas.length - 1 && (
                              <span className="absolute -right-2 top-1/2 transform -translate-y-1/2 translate-x-full w-1 h-1 rounded-full bg-slate-300"></span>
                            )}
                            
                            {/* Remove button */}
                            <motion.button
                              onClick={() => handleRemoveItem(item.id)}
                              initial={{ opacity: 0, scale: 0.5 }}
                              whileHover={{ scale: 1.2 }}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                              ×
                            </motion.button>
                          </motion.div>
                        ))}
                      </motion.div>
                    </SortableContext>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Results */}
              <AnimatePresence>
                {naturalLanguageRule && (
                  <motion.div 
                    className="card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: 'spring', damping: 20 }}
                  >
                    <div className="p-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                      <h3 className="text-sm font-medium text-slate-800 flex items-center">
                        <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                        Generated Rule
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Natural Language</p>
                        <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{naturalLanguageRule}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Generated Code</p>
                        <pre className="bg-slate-800 text-slate-100 p-3 rounded-lg overflow-x-auto text-sm">{generatedCode}</pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Drag Overlay */}
          <DragOverlay dropAnimation={{
            duration: 150,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {activeId ? (
              <div className={`px-3 py-2 rounded-lg shadow-md ${getComponentClass(getActiveComponent()?.type)}`}>
                <div className="flex items-center">
                  {getComponentIcon(getActiveComponent()?.type)}
                  {getActiveComponent()?.label}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default VisualRuleBuilder;