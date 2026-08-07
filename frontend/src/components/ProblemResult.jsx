import {RunResult, SubmitResult} from './ResultDisplay'
import {Terminal} from 'lucide-react';

const ProblemResult = ({ runResult, submitResult, loading }) => {
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 space-y-4">
        <span className="loading loading-spinner text-primary loading-lg"></span>
        <p className="text-base-content/60 font-medium animate-pulse">Evaluating your code...</p>
      </div>
    );
  }

  if (runResult) {
    return <RunResult result={runResult} />;
  }

  if (submitResult) {
    return <SubmitResult result={submitResult} />;
  }

  // Empty State
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-base-content/50">
      <Terminal className="w-12 h-12 mb-4 opacity-20" />
      <p>Run or submit your code to view the results here.</p>
    </div>
  );
};

export default ProblemResult;