import { useState } from 'react';
import { Check, Copy, Lightbulb } from 'lucide-react';

const SolutionBlock = ({ solution }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { language, code } = solution;
  const displayLanguage = language === 'cpp' ? 'C++' : language.charAt(0).toUpperCase() + language.slice(1);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 5000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="rounded-xl border border-base-content/10 bg-base-200 overflow-hidden shadow-lg mb-6">
      {/* Code Header (Language Badge & Copy Button) */}
      <div className="flex items-center justify-between px-4 py-2 bg-base-300 border-b border-base-content/10">
        <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
          {displayLanguage} Solution
        </span>
        
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-medium text-base-content/60 hover:text-base-content transition-colors p-1"
        >
          {isCopied ? (
            <><Check className="w-3.5 h-3.5 text-success" /> Copied!</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> Copy Code</>
          )}
        </button>
      </div>

      {/* The Code Block */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed text-base-content">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const ProblemSolution = ({ problem }) => {
  // Fallback if the admin hasn't provided a solution
  if (!problem || !problem.referenceSolutions || problem.referenceSolutions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-base-content/50">
        <Lightbulb className="w-12 h-12 mb-4 opacity-20" />
        <p>No Solution available for this problem yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div className="space-y-2 border-b border-base-content/10 pb-4">
        <div className="flex items-center gap-2 text-primary">
          <Lightbulb className="w-5 h-5" />
          <h2 className="text-xl font-bold text-base-content">Official Approach</h2>
        </div>
        <p className="text-base-content/60 text-sm">
          Review the reference solution to understand the optimal time and space complexity.
        </p>
      </div>

      {/* Solutions */}
      {problem.referenceSolutions.map((sol, index) => (
        <SolutionBlock key={index} solution={sol} />
      ))}
      
    </div>
  );
};

export default ProblemSolution;