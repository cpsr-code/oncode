import React, { useState, useEffect } from 'react';
import { Link } from 'react-router'; 
import { Edit, Trash2, AlertCircle } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

const ManageProblemsTable = () => {
  const [problems, setProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all problems when the component mounts
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/'); 
        setProblems(data.allProblems); 
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching problems:", err);
        setError("Failed to load problems. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, []);

  // Handle Problem Deletion
  const handleDelete = async (problemId, problemTitle) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete "${problemTitle}"? This action cannot be undone.`);
    
    if (isConfirmed) {
      try {
        await axiosClient.delete(`/problem/${problemId}`);
        //remove the problem from the UI
        setProblems(problems.filter(p => p._id !== problemId));
      } catch (err) {
        console.error("Error deleting problem:", err);
        alert("Failed to delete the problem. Please check your connection or server logs.");
      }
    }
  };

  // Helper to color-code difficulty badges
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-success/10 text-success border border-success/20';
      case 'medium': return 'bg-warning/10 text-warning border border-warning/20';
      case 'hard': return 'bg-error/10 text-error border border-error/20';
      default: return 'bg-base-300 text-base-content/60';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-base-content">
      
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-base-content">Manage Problems</h1>
        <p className="text-base-content/60 text-sm mt-1">View, update, or remove coding challenges.</p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-base-200 rounded-xl border border-base-content/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="table w-full">
            {/* Table Head */}
            <thead className="text-base-content/60 border-b border-base-content/10 bg-base-300">
              <tr>
                <th className="font-medium tracking-wider bg-transparent py-4">Title</th>
                <th className="font-medium tracking-wider bg-transparent py-4">Difficulty</th>
                <th className="font-medium tracking-wider bg-transparent py-4">Topics</th>
                <th className="font-medium tracking-wider bg-transparent py-4 text-right">Actions</th>
              </tr>
            </thead>
            
            {/* Table Body */}
            <tbody>
              {problems.length > 0 ? (
                problems.map((problem) => (
                  <tr key={problem._id} className="border-b border-base-content/5 hover:bg-base-300 transition-colors">
                    
                    {/* Title */}
                    <td className="font-medium text-base-content bg-transparent">
                      {problem.number ? `${problem.number}. ` : ''}{problem.title}
                    </td>
                    
                    {/* Difficulty */}
                    <td className="bg-transparent">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getDifficultyBadge(problem.difficulty)}`}>
                        {problem.difficulty || 'Unknown'}
                      </span>
                    </td>
                    
                    {/* Topics */}
                    <td className="bg-transparent max-w-xs truncate">
                      <div className="flex gap-1 flex-wrap">
                        {problem.topics?.slice(0, 3).map((topic, idx) => (
                          <span key={idx} className="text-xs bg-base-300 text-base-content px-2 py-0.5 rounded border border-base-content/20">
                            {topic}
                          </span>
                        ))}
                        {problem.topics?.length > 3 && (
                          <span className="text-xs text-base-content/50 px-1 py-0.5">+{problem.topics.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Actions (Update / Delete) */}
                    <td className="bg-transparent text-right">
                      <div className="flex justify-end gap-2">
                        {/* Update Button */}
                        <Link 
                          to={`/admin/update-problem/${problem._id}`}
                          className="btn btn-sm btn-ghost btn-square text-primary hover:bg-primary/10 hover:text-primary"
                          title="Update Problem"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        
                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDelete(problem._id, problem.title)}
                          className="btn btn-sm btn-ghost btn-square text-error hover:bg-error/10 hover:text-error"
                          title="Delete Problem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-base-content/50 bg-transparent">
                    <p className="text-lg">No problems found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageProblemsTable;