// Translation strings for the application
// Organized by language code and sections

const translations = {
  en: {
    general: {
      appName: 'RuleWeave',
      tagline: 'Convert natural language to structured rules instantly',
      beta: 'Beta',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      create: 'Create',
      update: 'Update',
      required: 'Required',
      optional: 'Optional',
      success: 'Success',
      error: 'Error',
      close: 'Close',
    },
    navigation: {
      textEditor: 'Text Editor',
      visualBuilder: 'Visual Builder',
      guidedWizard: 'Guided Wizard',
      templates: 'Templates',
      new: 'NEW',
    },
    editorSettings: {
      suggestions: 'Suggestions',
      realtime: 'Real-time',
      inlineHelp: 'Inline help',
    },
    apiKey: {
      label: 'Claude API Key',
      placeholder: 'Enter your API key to enable translation',
      set: 'API Key Set',
      required: 'Required for translation',
    },
    editor: {
      ruleName: 'Rule Name',
      ruleNamePlaceholder: 'Enter rule name...',
      describeRule: 'Describe your rule in natural language',
      placeholder: 'E.g., Flag transactions over $500 from new users in high-risk countries',
      accessibilityDesc: 'Enter a description of your business rule in plain language. This will be converted to code.',
      realtimeActive: 'Translation updates as you type',
      translate: 'Translate to Rule',
      translating: 'Translating...',
      generatedRule: 'Generated Rule',
      updates: 'Updates in real-time as you type above',
      validate: 'Validate Rule',
      validating: 'Validating...',
      saveRule: 'Save Rule',
      noRuleToValidate: 'No rule to validate',
      noRuleToSave: 'No rule to save',
      pleaseEnterName: 'Please enter a name for this rule',
      pleaseEnterRule: 'Please enter a rule description',
      pleaseEnterApiKey: 'Please enter your Claude API key',
    },
    validation: {
      passed: 'Validation Passed',
      issues: 'Validation Issues',
      errors: 'Errors',
      suggestions: 'Suggestions',
      autoFix: 'Auto-Fix Rule',
    },
    visualBuilder: {
      title: 'Visual Rule Builder',
      subjects: 'Subjects',
      conditions: 'Conditions',
      operators: 'Logical Operators',
      values: 'Custom Values',
      valueLabel: 'Add Value',
      valuePlaceholder: 'Enter a value (number, text, date, etc.)',
      pressEnter: 'Press Enter to add',
      canvas: 'Rule Canvas',
      dragHint: '(Drag and drop components to build your rule)',
      emptyCanvas: 'Drag components here from the left panel',
      startHint: 'Start by adding a subject (like "transaction.amount")',
      clearCanvas: 'Clear Canvas',
      naturalLanguage: 'Natural Language',
      generatedCode: 'Generated Code',
    },
    savedRules: {
      title: 'My Rules',
      noRules: 'No saved rules yet',
      createFirst: 'Create your first rule',
      updated: 'Updated',
    },
    versionHistory: {
      title: 'Version History',
      revert: 'Revert',
      current: 'Current',
      revertPrefix: 'Revert #',
    },
    accessibility: {
      settings: 'Accessibility Settings',
      skipToContent: 'Skip to main content',
      darkMode: 'Toggle dark mode',
      highContrast: 'High contrast mode',
      highContrastDescription: 'Increases color contrast for better readability',
      reducedMotion: 'Reduced motion',
      reducedMotionDescription: 'Minimizes animations and transitions',
      textSize: 'Text size',
      textSizeChanged: 'Text size changed to',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      extraLarge: 'Extra Large',
      keyboardShortcuts: 'Keyboard Shortcuts',
      navigateFields: 'Navigate between fields',
      translateRule: 'Translate rule',
    },
  },
  es: {
    general: {
      appName: 'RuleWeave',
      tagline: 'Convierte lenguaje natural en reglas estructuradas al instante',
      beta: 'Beta',
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      create: 'Crear',
      update: 'Actualizar',
      required: 'Requerido',
      optional: 'Opcional',
      success: 'Éxito',
      error: 'Error',
      close: 'Cerrar',
    },
    navigation: {
      textEditor: 'Editor de Texto',
      visualBuilder: 'Constructor Visual',
      guidedWizard: 'Asistente Guiado',
      templates: 'Plantillas',
      new: 'NUEVO',
    },
    editorSettings: {
      suggestions: 'Sugerencias',
      realtime: 'Tiempo real',
      inlineHelp: 'Ayuda en línea',
    },
    apiKey: {
      label: 'Clave API de Claude',
      placeholder: 'Introduce tu clave API para habilitar la traducción',
      set: 'Clave API Configurada',
      required: 'Requerida para traducción',
    },
    editor: {
      ruleName: 'Nombre de la Regla',
      ruleNamePlaceholder: 'Introduce el nombre de la regla...',
      describeRule: 'Describe tu regla en lenguaje natural',
      placeholder: 'Ej., Marcar transacciones mayores de $500 de usuarios nuevos en países de alto riesgo',
      accessibilityDesc: 'Introduce una descripción de tu regla de negocio en lenguaje natural. Esto se convertirá en código.',
      realtimeActive: 'La traducción se actualiza mientras escribes',
      translate: 'Traducir a Regla',
      translating: 'Traduciendo...',
      generatedRule: 'Regla Generada',
      updates: 'Se actualiza en tiempo real mientras escribes arriba',
      validate: 'Validar Regla',
      validating: 'Validando...',
      saveRule: 'Guardar Regla',
      noRuleToValidate: 'No hay regla para validar',
      noRuleToSave: 'No hay regla para guardar',
      pleaseEnterName: 'Por favor, introduce un nombre para esta regla',
      pleaseEnterRule: 'Por favor, introduce una descripción de la regla',
      pleaseEnterApiKey: 'Por favor, introduce tu clave API de Claude',
    },
    validation: {
      passed: 'Validación Exitosa',
      issues: 'Problemas de Validación',
      errors: 'Errores',
      suggestions: 'Sugerencias',
      autoFix: 'Corregir Automáticamente',
    },
    visualBuilder: {
      title: 'Constructor Visual de Reglas',
      subjects: 'Sujetos',
      conditions: 'Condiciones',
      operators: 'Operadores Lógicos',
      values: 'Valores Personalizados',
      valueLabel: 'Añadir Valor',
      valuePlaceholder: 'Introduce un valor (número, texto, fecha, etc.)',
      pressEnter: 'Presiona Enter para añadir',
      canvas: 'Lienzo de Reglas',
      dragHint: '(Arrastra y suelta componentes para construir tu regla)',
      emptyCanvas: 'Arrastra componentes aquí desde el panel izquierdo',
      startHint: 'Comienza añadiendo un sujeto (como "transaction.amount")',
      clearCanvas: 'Limpiar Lienzo',
      naturalLanguage: 'Lenguaje Natural',
      generatedCode: 'Código Generado',
    },
    savedRules: {
      title: 'Mis Reglas',
      noRules: 'Aún no hay reglas guardadas',
      createFirst: 'Crea tu primera regla',
      updated: 'Actualizada',
    },
    versionHistory: {
      title: 'Historial de Versiones',
      revert: 'Revertir',
      current: 'Actual',
      revertPrefix: 'Revertir #',
    },
    accessibility: {
      settings: 'Configuración de Accesibilidad',
      skipToContent: 'Saltar al contenido principal',
      darkMode: 'Cambiar a modo oscuro',
      highContrast: 'Modo de alto contraste',
      highContrastDescription: 'Aumenta el contraste de colores para mejor legibilidad',
      reducedMotion: 'Movimiento reducido',
      reducedMotionDescription: 'Minimiza animaciones y transiciones',
      textSize: 'Tamaño del texto',
      textSizeChanged: 'Tamaño de texto cambiado a',
      small: 'Pequeño',
      medium: 'Mediano',
      large: 'Grande',
      extraLarge: 'Extra Grande',
      keyboardShortcuts: 'Atajos de Teclado',
      navigateFields: 'Navegar entre campos',
      translateRule: 'Traducir regla',
    },
  },
  // Additional languages could be added here
};

/**
 * Get a translation string based on the language and key path
 * @param {string} lang - Language code (e.g. 'en', 'es')
 * @param {string} path - Dot-notation path to the translation string (e.g. 'general.appName')
 * @param {Object} placeholders - Optional placeholders to replace in the string (e.g. {name: 'John'})
 * @returns {string} The translated string
 */
export const t = (lang, path, placeholders = {}) => {
  // Default to English if the specified language isn't available
  const language = translations[lang] || translations.en;
  
  // Navigate through the nested keys
  const keys = path.split('.');
  let value = language;
  
  for (const key of keys) {
    value = value[key];
    
    // If at any point we hit undefined, fall back to English
    if (value === undefined) {
      value = translations.en;
      for (const engKey of keys) {
        value = value[engKey];
        if (value === undefined) {
          return path; // Last resort fallback
        }
      }
      break;
    }
  }
  
  // Replace any placeholders in the string
  let result = String(value);
  Object.entries(placeholders).forEach(([key, val]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), val);
  });
  
  return result;
};

export default translations;