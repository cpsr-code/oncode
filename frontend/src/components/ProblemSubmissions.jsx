import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, Cpu, FileTerminal, AlertCircle } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const ProblemSubmissions = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null); // Tracks which submission accordion is open

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await axiosClient.get(`/problem/submissions/${problemId}`); 
        console.log(data);

        setSubmissions(data.submissions || []);
        setIsLoading(false);  
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError("Failed to load submissions.");
        setIsLoading(false);
      }
    };

    if (problemId) {
      fetchSubmissions();
    }
  }, [problemId]);

  // Helper to color-code the status
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'text-success';
      default: return 'text-error';
    }
  };

  // Helper to format the timestamp cleanly (e.g., "May 21, 2026")
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-10">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-16 bg-base-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-base-content/50">
        <AlertCircle className="w-10 h-10 mb-4 text-error/50" />
        <p>{error}</p>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-base-content/50">
        <FileTerminal className="w-12 h-12 mb-4 opacity-20" />
        <p>You have not submitted any code for this problem yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">
      <h2 className="text-xl font-bold text-base-content border-b border-base-content/10 pb-2 mb-4">Past Submissions</h2>
      
      {submissions.map((sub) => {
        const isExpanded = expandedId === sub._id;
        
        return (
          <div key={sub._id} className="bg-base-100 border border-base-content/10 rounded-lg overflow-hidden transition-all duration-200 hover:border-base-content/20">
            
            {/* --- Accordion Header (Always Visible) --- */}
            <div 
              onClick={() => toggleExpand(sub._id)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-base-200 transition-colors"
            >
              {/* Left Side: Status & Test Cases */}
              <div className="flex flex-col gap-1">
                <span className={`text-lg font-bold ${getStatusColor(sub.status)} capitalize`}>
                  {sub.status || 'Pending'}
                </span>
                <span className="text-xs font-medium text-base-content/50">
                  {sub.testCasesPassed} / {sub.testCasesTotal} Testcases Passed
                </span>
              </div>

              {/* Right Side: Metrics, Date & Toggle Icon */}
              <div className="flex items-center gap-6 text-xs text-base-content/60">
                <div className="hidden sm:flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {sub.runtime} ms</span>
                    <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {sub.memory} MB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base-content/80 uppercase">{sub.language}</span>
                    <span>•</span>
                    <span>{formatDate(sub.createdAt)}</span>
                  </div>
                </div>
                
                {/* Mobile Date Fallback */}
                <span className="sm:hidden">{formatDate(sub.createdAt)}</span>
                
                {isExpanded ? <ChevronUp className="w-5 h-5 text-base-content/50" /> : <ChevronDown className="w-5 h-5 text-base-content/50" />}
              </div>
            </div>

            {/* --- Accordion Body: Code & Errors (Expanded State) --- */}
            {isExpanded && (
              <div className="border-t border-base-content/10 bg-base-300">
                
                {/* Render error message if it exists */}
                {sub.errorMessage && (
                  <div className="p-4 bg-error/10 border-b border-error/20">
                    <p className="text-error font-mono text-xs whitespace-pre-wrap">{sub.errorMessage}</p>
                  </div>
                )}
                
                {/* Code Block */}
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono leading-relaxed text-base-content">
                    <code>{sub.code}</code>
                  </pre>
                </div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProblemSubmissions;