import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router'; 
import { LogOut, Trash2, Shield, Calendar, Mail } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../features/auth/authSlice'; 
import GlobalNavbar from '../components/GlobalNavbar'; 

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Identity base state
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    totalSolved: 0,
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    acceptanceRate: 0, 
    joinDate: 'Loading...' 
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch calculated statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const { data } = await axiosClient.get('/user/profile');
        setStats(data.stats);
      } catch (error) {
        console.error("Failed to fetch user stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleDeleteProfile = async () => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure you want to delete your account? This action cannot be undone and you will lose all your submissions."
    );
    
    if (confirmDelete) {
      try {
        await axiosClient.delete('/user/profile');
        await dispatch(logoutUser()).unwrap(); 
        navigate('/signup', { replace: true });
      } catch (err) {
        console.error("Failed to delete account:", err);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  if (!user) return null; 

  return (
    <div className="min-h-screen bg-base-300 text-base-content font-sans">
      <GlobalNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-base-content mb-8">Account Overview</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ================= LEFT COLUMN: Identity & Actions ================= */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            
            <div className="bg-base-100 border border-base-content/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

              <div className="flex items-center gap-5 mb-6">
                <div className="avatar placeholder">
                  {/* Fixed Tailwind Gradient syntax here */}
                  <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-20 h-20 text-3xl font-bold shadow-lg flex items-center justify-center">
                    <span>{user.firstName?.charAt(0).toUpperCase() || 'U'}</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-base-content">{user.firstName} {user.lastName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {user.role === 'admin' ? (
                      <span className="badge badge-error badge-sm gap-1 bg-error/10 text-error border-error/20 font-medium">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="badge badge-info badge-sm bg-primary/10 text-primary border-primary/20 font-medium">
                        Standard User
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm text-base-content/70">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-base-content/50" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-base-content/50" />
                  <span>Joined {stats.joinDate}</span>
                </div>
              </div>
            </div>

            <div className="bg-base-100 border border-base-content/10 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-base-content/50 uppercase tracking-wider mb-2">Account Settings</h3>
              
              <button 
                onClick={handleLogout}
                className="btn w-full bg-base-200 hover:bg-base-300 text-base-content border-base-content/20 hover:border-base-content/30 flex justify-start gap-3"
              >
                <LogOut className="w-4 h-4 text-base-content/50" />
                Log Out
              </button>

              <div className="divider border-base-content/10 my-2"></div>

              <button 
                onClick={handleDeleteProfile}
                className="btn w-full bg-error/10 hover:bg-error/20 text-error border-error/20 hover:border-error/50 flex justify-start gap-3"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Statistics ================= */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            
            <div className="bg-base-100 border border-base-content/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-base-content">Problems Solved</h3>
                  <p className="text-base-content/70 text-sm mt-1">Your progress across different difficulties</p>
                </div>
                <div className="text-4xl font-black text-base-content">
                  {stats.totalSolved}
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-10 bg-base-200 rounded-lg"></div>
                  <div className="h-10 bg-base-200 rounded-lg"></div>
                  <div className="h-10 bg-base-200 rounded-lg"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-success">Easy</span>
                      <span className="text-base-content/70 font-medium">{stats.easySolved}</span>
                    </div>
                    <progress className="progress progress-success w-full bg-base-content/20" value={stats.easySolved} max={stats.totalSolved || 1}></progress>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-warning">Medium</span>
                      <span className="text-base-content/70 font-medium">{stats.mediumSolved}</span>
                    </div>
                    <progress className="progress progress-warning w-full bg-base-content/20" value={stats.mediumSolved} max={stats.totalSolved || 1}></progress>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-error">Hard</span>
                      <span className="text-base-content/70 font-medium">{stats.hardSolved}</span>
                    </div>
                    <progress className="progress progress-error w-full bg-base-content/20" value={stats.hardSolved} max={stats.totalSolved || 1}></progress>
                  </div>
                </div>
              )}
            </div>

            <div className="stats stats-vertical sm:stats-horizontal bg-base-100 border border-base-content/10 rounded-2xl shadow-xl overflow-hidden w-full text-base-content">
              
              <div className="stat place-items-center sm:place-items-start border-base-content/10 p-6">
                <div className="stat-title text-base-content/70 font-medium">Total Submissions</div>
                <div className="stat-value text-base-content">{stats.totalSubmissions}</div>
                <div className="stat-desc text-base-content/50 mt-1">Code evaluations run</div>
              </div>
              
              <div className="stat place-items-center sm:place-items-start border-base-content/10 p-6">
                <div className="stat-title text-base-content/70 font-medium">Accepted</div>
                <div className="stat-value text-success">{stats.acceptedSubmissions}</div>
                <div className="stat-desc text-base-content/50 mt-1">Successful solutions</div>
              </div>
              
              <div className="stat place-items-center sm:place-items-start border-base-content/10 p-6">
                <div className="stat-title text-base-content/70 font-medium">Acceptance Rate</div>
                <div className="stat-value text-primary">{stats.acceptanceRate}%</div>
                <div className="stat-desc text-base-content/50 mt-1">Accuracy across all attempts</div>
              </div>
              
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;