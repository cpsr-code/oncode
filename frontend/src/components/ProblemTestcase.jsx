import { Terminal } from 'lucide-react';

const ProblemTestcase = ({ problem }) => {
  // Graceful fallback if the problem object or the visibleTestCase is missing
  if (!problem || !problem.visibleTestCase) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-base-content/50">
        <Terminal className="w-12 h-12 mb-4 opacity-20" />
        <p>No test case data available for this problem.</p>
      </div>
    );
  }

  const { input, expectedOutput } = problem.visibleTestCase;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-base-300">
      <div className="flex items-center gap-2 mb-6 border-b border-base-content/10 pb-2">
        <Terminal className="w-5 h-5 text-base-content/60" />
        <h2 className="text-lg font-semibold text-base-content">Sample Testcase</h2>
      </div>

      <div className="space-y-6 max-w-3xl">
        
        {/* --- Input Block --- */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-base-content/60 uppercase tracking-wider">
            Input
          </label>
          <div className="bg-base-200 border border-base-content/20 rounded-lg p-4 shadow-inner">
            <pre className="font-mono text-sm text-base-content/80 whitespace-pre-wrap break-all">
              {input}
            </pre>
          </div>
        </div>

        {/* --- Expected Output Block --- */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-base-content/60 uppercase tracking-wider">
            Expected Output
          </label>
          <div className="bg-base-200 border border-base-content/20 rounded-lg p-4 shadow-inner">
            <pre className="font-mono text-sm text-base-content/80 whitespace-pre-wrap break-all">
              {expectedOutput}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProblemTestcase;