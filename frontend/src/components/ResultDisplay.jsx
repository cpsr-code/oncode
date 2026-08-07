import { CheckCircle, XCircle, AlertTriangle, Clock, Cpu, Terminal } from 'lucide-react';

// --- Shared Utility Functions ---
const getStatusColor = (status) => {
  const s = status?.toLowerCase();
  if (s === 'accepted') return 'text-success';
  if (s === 'wrong answer') return 'text-error';
  if (s === 'time limit exceeded') return 'text-warning';
  return 'text-error'; // Default for compile/runtime errors
};

const getStatusIcon = (status) => {
  const s = status?.toLowerCase();
  if (s === 'accepted') return <CheckCircle className="w-6 h-6 text-success" />;
  if (s === 'time limit exceeded') return <Clock className="w-6 h-6 text-warning" />;
  return <XCircle className="w-6 h-6 text-error" />;
};


// --- 1. Run Result Display (Single Test Case Focus) ---
const RunResult = ({ result }) => {
  const isError = result.status !== 'Accepted' && result.errorMessage;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-base-300">
      <div className="flex items-center gap-3 mb-6 border-b border-base-content/10 pb-4">
        {getStatusIcon(result.status)}
        <h2 className={`text-2xl font-bold capitalize ${getStatusColor(result.status)}`}>
          {result.status}
        </h2>
      </div>

      {isError ? (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-error uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Error Details
          </label>
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <pre className="font-mono text-sm text-error whitespace-pre-wrap">
              {result.errorMessage}
            </pre>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Input</label>
            <div className="bg-base-200 border border-base-content/20 rounded-lg p-3">
              <pre className="font-mono text-sm text-base-content/80 whitespace-pre-wrap break-all">{result.input}</pre>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Actual Output</label>
            <div className="bg-base-200 border border-base-content/20 rounded-lg p-3">
              <pre className={`font-mono text-sm whitespace-pre-wrap break-all ${result.status === 'Accepted' ? 'text-base-content/80' : 'text-error'}`}>
                {result.actualOutput || 'No output'}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Expected Output</label>
            <div className="bg-base-200 border border-base-content/20 rounded-lg p-3">
              <pre className="font-mono text-sm text-base-content/80 whitespace-pre-wrap break-all">{result.expectedOutput}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 2. Submit Result Display (Metrics & Edge Case Focus) ---
const SubmitResult = ({ result }) => {
  const isAccepted = result.status === 'Accepted';

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-base-300">
      
      {/* Header & Main Status */}
      <div className="mb-8 space-y-2 border-b border-base-content/10 pb-6">
        <div className="flex items-center gap-3">
          {getStatusIcon(result.status)}
          <h2 className={`text-3xl font-bold capitalize ${getStatusColor(result.status)}`}>
            {result.status}
          </h2>
        </div>
        
        {/* Sub-metrics (Testcases passed) */}
        <p className="text-base-content/60 font-medium text-sm ml-9">
          {result.testCasesPassed} / {result.testCasesTotal} testcases passed
        </p>
      </div>

      {/* Performance Metrics (Only show if code compiled/ran successfully) */}
      {!result.errorMessage && (
        <div className="flex gap-6 mb-8 ml-2">
          <div className="flex items-center gap-3 bg-base-100 border border-base-content/10 px-5 py-3 rounded-xl">
            <Clock className="w-5 h-5 text-info" />
            <div>
              <p className="text-xs text-base-content/50 uppercase font-semibold">Runtime</p>
              <p className="text-lg font-bold text-base-content/90">{result.runtime} ms</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-base-100 border border-base-content/10 px-5 py-3 rounded-xl">
            <Cpu className="w-5 h-5 text-secondary" />
            <div>
              <p className="text-xs text-base-content/50 uppercase font-semibold">Memory</p>
              <p className="text-lg font-bold text-base-content/90">{result.memory} MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Output (Compilation or Runtime Errors) */}
      {result.errorMessage && (
        <div className="space-y-2 max-w-3xl">
          <label className="text-sm font-semibold text-error uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Error Details
          </label>
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <pre className="font-mono text-sm text-error whitespace-pre-wrap">
              {result.errorMessage}
            </pre>
          </div>
        </div>
      )}

      {/* Failed Test Case Output (Wrong Answer) */}
      {!isAccepted && result.failedTestCase && (
        <div className="space-y-6 max-w-3xl mt-6 border-t border-base-content/10 pt-6">
          <h3 className="text-lg font-semibold text-base-content/80 mb-4">Failing Test Case</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Input</label>
            <div className="bg-base-200 border border-base-content/20 rounded-lg p-3">
              <pre className="font-mono text-sm text-base-content/80 whitespace-pre-wrap break-all">{result.failedTestCase.input}</pre>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Actual Output</label>
            <div className="bg-base-200 border border-error/40 rounded-lg p-3">
              <pre className="font-mono text-sm text-error whitespace-pre-wrap break-all">
                {result.failedTestCase.actualOutput || 'No output'}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">Expected Output</label>
            <div className="bg-base-200 border border-success/40 rounded-lg p-3">
              <pre className="font-mono text-sm text-success whitespace-pre-wrap break-all">{result.failedTestCase.expectedOutput}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export {RunResult, SubmitResult};