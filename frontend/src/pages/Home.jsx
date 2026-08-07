import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router'; 
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, Circle } from 'lucide-react'; 
import axiosClient from '../utils/axiosClient';
import GlobalNavbar from '../components/GlobalNavbar';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [filters, setFilters] = useState({
    difficulty: 'all',
    topic: 'all',
    status: 'all'
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const problemRes = await axiosClient.get('/problem/');
        setProblems(problemRes.data.allProblems || problemRes.data);    
        
        // If logged in, fetch solved problems
        if (user) {
          const solvedRes = await axiosClient.get('/problem/solved'); 
          setSolvedProblems(solvedRes.data.solvedProblems || []);
        }
      } catch (error) {
        console.error("Error fetching data: ", error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, [user]);
  

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // --- Dynamic Data Extraction ---
  // Automatically find all unique topics from the database using a Set
  const uniqueTopics = useMemo(() => {
    const topicsSet = new Set();
    problems.forEach(p => {
      if (p.topics) {
        p.topics.forEach(t => topicsSet.add(t));
      }
    });
    return Array.from(topicsSet).sort(); 
  }, [problems]);

  // --- Filter Logic ---
  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty?.toLowerCase() === filters.difficulty;
    
    const topicMatch = filters.topic === 'all' || 
      (problem.topics && problem.topics.some(t => t.toLowerCase() === filters.topic.toLowerCase()));
    
    let statusMatch = true;
    if (filters.status === 'solved') {
      statusMatch = solvedProblems.some((sp) => sp._id === problem._id);
    } else if (filters.status === 'unsolved') {
      statusMatch = !solvedProblems.some((sp) => sp._id === problem._id);
    }

    return difficultyMatch && topicMatch && statusMatch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-success/10 text-success border-success/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'hard': return 'bg-error/10 text-error border-error/20';
      default: return 'bg-base-200 text-base-content/70 border-base-content/20';
    }
  };

  return (
    <div className="min-h-screen bg-base-300 font-sans text-base-content">
      
      <GlobalNavbar /> 

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <select 
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="select select-bordered bg-base-100 border-base-content/20 text-base-content focus:outline-none focus:border-primary w-full sm:w-48"
          >
            <option value="all">Status: All</option>
            {user && <option value="solved">Solved</option>}
            {user && <option value="unsolved">Unsolved</option>}
          </select>

          <select 
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
            className="select select-bordered bg-base-100 border-base-content/20 text-base-content focus:outline-none focus:border-primary w-full sm:w-48"
          >
            <option value="all">Difficulty: All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Dynamic Topics Filter */}
          <select 
            name="topic"
            value={filters.topic}
            onChange={handleFilterChange}
            className="select select-bordered bg-base-100 border-base-content/20 text-base-content focus:outline-none focus:border-primary w-full sm:w-48 capitalize"
          >
            <option value="all">Topics: All</option>
            {uniqueTopics.map((topic) => (
              <option key={topic} value={topic.toLowerCase()}>{topic}</option>
            ))}
          </select>
        </div>

        {/* Problems List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading State
            <div className="flex justify-center items-center py-20">
               <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : filteredProblems.length > 0 ? (
            // Render Problems
            filteredProblems.map((problem) => {
              const isSolved = solvedProblems.some(sp => sp._id === problem._id);

              return (
                <div 
                  key={problem._id} 
                  className="group flex items-center justify-between bg-base-100 hover:bg-base-200 transition-all duration-200 p-5 rounded-xl border border-base-content/10 hover:border-base-content/20 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 shrink-0">
                      {isSolved ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <Circle className="w-5 h-5 text-base-content/20" /> 
                      )}
                    </div>

                    <div className="space-y-2">
                      <Link to={`/problem/${problem._id}`} className="text-lg font-medium text-base-content group-hover:text-primary transition-colors">
                        {problem.number ? `${problem.number}. ` : ''}{problem.title}
                      </Link>
                      
                      {problem.topics && problem.topics.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {problem.topics.map((topic) => (
                            <span key={topic} className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-base-content/10 text-base-content/80 border border-base-content/20 capitalize">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty || 'Unknown'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            // Empty State
            <div className="text-center py-20 bg-base-100 rounded-xl border border-base-content/10">
              <h3 className="text-xl text-base-content/50 font-medium">No problems found matching your filters.</h3>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;