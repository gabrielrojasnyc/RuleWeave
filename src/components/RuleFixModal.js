import React from 'react';

const RuleFixModal = ({ 
  isOpen, 
  onClose, 
  fixResult, 
  onApplyFix 
}) => {
  if (!isOpen || !fixResult) return null;
  
  const { fixedRule, fixExplanations, confidenceScore, wasFixed } = fixResult;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal dialog */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-semibold text-slate-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                AI Rule Fix Results
              </h3>
              <div className="flex items-center">
                {wasFixed && (
                  <div className="flex items-center mr-3">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden mr-2">
                      <div 
                        className={`h-full ${
                          confidenceScore > 80 ? 'bg-emerald-500' : 
                          confidenceScore > 50 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${confidenceScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-slate-500">{confidenceScore}%</span>
                  </div>
                )}
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {wasFixed ? (
              <>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Changes Made:</h4>
                  <ul className="space-y-1 text-sm">
                    {fixExplanations.map((explanation, index) => (
                      <li key={index} className="text-slate-600 flex items-center">
                        <svg className="w-4 h-4 mr-1.5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                        {explanation}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Fixed Rule:</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-md p-3 font-mono text-sm text-slate-800 overflow-x-auto">
                    {fixedRule}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="mt-3 text-base font-medium text-slate-900">No automatic fixes available</h3>
                <p className="mt-2 text-sm text-slate-500">
                  The rule either has complex errors that require manual correction, or doesn't have any detectable issues.
                </p>
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {wasFixed && (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-base font-medium text-white hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => onApplyFix(fixedRule)}
              >
                Apply Fix
              </button>
            )}
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              {wasFixed ? 'Cancel' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleFixModal;