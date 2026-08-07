import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ProblemDescription = ({ problem }) => {
  if (!problem) return null;

  // Helper to color-code difficulty badges
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-success/10 text-success border-success/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'hard': return 'bg-error/10 text-error border-error/20';
      default: return 'bg-base-200 text-base-content/70 border-base-content/20';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* --- 1. HEADER: Title, Difficulty, and Topics --- */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-base-content">{problem.number ? `${problem.number}. ` : ''}{problem.title}</h1>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Badge */}
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          
          {/* Topic Badges */}
          {problem.topics?.map((topic, index) => (
            <span 
              key={index} 
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-base-200 text-base-content/70 border border-base-content/20 capitalize cursor-pointer hover:bg-base-300 transition-colors"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* --- 2. MAIN DESCRIPTION --- */}
      <div className="prose prose-invert max-w-none text-base-content/80 leading-relaxed text-lg whitespace-pre-wrap">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {problem.description}
        </ReactMarkdown>
      </div>

      {/* --- 3. EXAMPLES SECTION --- */}
      {problem.examples && problem.examples.length > 0 && (
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-base-content mb-4 border-b border-base-content/10 pb-2">Examples</h2>
          {problem.examples.map((example, index) => (
            <div key={example._id || index} className="space-y-2">
              <p className="font-semibold text-base-content text-sm">Example {index + 1}:</p>
              
              <div className="bg-base-200 border-l-4 border-base-content/20 rounded-r-lg p-4 font-mono text-sm flex flex-col gap-4">
                

                {/* Input Block */}
                <div>
                  <span className="font-semibold text-base-content/60 block mb-1">Input:</span>
                  <pre className="text-base-content/80 whitespace-pre-wrap break-all m-0 font-inherit">
                    {example.input}
                  </pre>
                </div>
                

                {/* Output Block */}
                <div>
                  <span className="font-semibold text-base-content/60 block mb-1">Output:</span>
                  <pre className="text-base-content/80 whitespace-pre-wrap break-all m-0 font-inherit">
                    {example.output}
                  </pre>
                </div>
                
                
                {/* Explanation Block */}
                {example.explanation && (
                  <div className="pt-3 border-t border-base-content/10">
                    <span className="font-semibold text-base-content/60 block mb-1">Explanation:</span>
                    <span className="text-base-content/80 whitespace-pre-wrap block">
                      {example.explanation}
                    </span>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- 4. CONSTRAINTS SECTION --- */}
      {problem.constraints && problem.constraints.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-base-content mb-2 border-b border-base-content/10 pb-2">Constraints</h2>
          <ul className="list-disc list-inside space-y-1.5 ml-1">
            {problem.constraints.map((constraint, index) => (
              <li key={index} className="text-base-content/80 text-sm">
                <code className="bg-base-200 text-base-content px-1.5 py-0.5 rounded border border-base-content/10 font-mono text-xs whitespace-pre-wrap wrap-break-words">
                  {constraint}
                </code>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};

export default ProblemDescription;