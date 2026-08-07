import React, { useState, useEffect } from 'react';
import { Code2, Users, Activity, Target, Shield, User } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';


const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);


  useEffect(() => {
    const fetchDashboardStats = async () => {
     try{
        const { data } = await axiosClient.get('/admin/dashboard')
        setData(data);
        console.log(data);
       setIsLoading(false);
     }catch(error){
         console.error("Error in fetching data: " + error.message);
         setIsLoading(false);
       }
    };
    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  // Helper calculation for progress bars
  const totalProblems = data.difficulty.easy + data.difficulty.medium + data.difficulty.hard;
  const totalUsers = data.demographics.standard + data.demographics.admin;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-base-content">Platform Overview</h1>
        <p className="text-base-content/60 text-sm mt-1">Real-time metrics and analytical breakdowns.</p>
      </div>

      {/* --- TOP ROW: CORE METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Problems Card */}
        <div className="bg-base-200 p-6 rounded-xl border border-base-content/10 flex items-center justify-between">
          <div>
            <p className="text-base-content/60 text-sm font-medium mb-1">Total Problems</p>
            <h3 className="text-3xl font-bold text-base-content">{data.metrics.totalProblems}</h3>
          </div>
          <div className="bg-primary/10 p-3 rounded-lg text-primary">
            <Code2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Users Card */}
        <div className="bg-base-200 p-6 rounded-xl border border-base-content/10 flex items-center justify-between">
          <div>
            <p className="text-base-content/60 text-sm font-medium mb-1">Total Users</p>
            <h3 className="text-3xl font-bold text-base-content">{data.metrics.totalUsers}</h3>
          </div>
          <div className="bg-primary/10 p-3 rounded-lg text-primary">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Submissions Card */}
        <div className="bg-base-200 p-6 rounded-xl border border-base-content/10 flex items-center justify-between">
          <div>
            <p className="text-base-content/60 text-sm font-medium mb-1">Total Submissions</p>
            <h3 className="text-3xl font-bold text-base-content">{data.metrics.totalSubmissions.toLocaleString()}</h3>
          </div>
          <div className="bg-primary/10 p-3 rounded-lg text-primary">
            <Activity className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* --- MIDDLE ROW: ANALYTICAL BREAKDOWNS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Platform Acceptance Rate */}
        <div className="bg-base-200 p-6 rounded-xl border border-base-content/10 flex flex-col items-center justify-center text-center">
          <div className="w-full flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-base-content">Acceptance Rate</h2>
            <Target className="w-5 h-5 text-base-content/50" />
          </div>
          
          {/* DaisyUI Radial Progress */}
          <div 
            className="radial-progress text-primary font-bold text-2xl" 
            style={{ "--value": data.acceptanceRate, "--size": "8rem", "--thickness": "8px" }} 
            role="progressbar"
          >
            {data.acceptanceRate}%
          </div>
          <p className="text-base-content/60 text-sm mt-6">
            Percentage of total submissions resulting in "Accepted" status.
          </p>
        </div>

        {/* 2. Problem Difficulty Distribution */}
        <div className="bg-base-200 p-6 rounded-xl border border-base-content/10">
          <h2 className="text-lg font-semibold text-base-content mb-6">Difficulty Distribution</h2>
          
          <div className="space-y-5">
            {/* Easy */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-success font-medium">Easy</span>
                <span className="text-base-content/60">{data.difficulty.easy} problems</span>
              </div>
              <progress className="progress progress-success w-full bg-base-300" value={data.difficulty.easy} max={totalProblems}></progress>
            </div>
            
            {/* Medium */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-warning font-medium">Medium</span>
                <span className="text-base-content/60">{data.difficulty.medium} problems</span>
              </div>
              <progress className="progress progress-warning w-full bg-base-300" value={data.difficulty.medium} max={totalProblems}></progress>
            </div>
            
            {/* Hard */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-error font-medium">Hard</span>
                <span className="text-base-content/60">{data.difficulty.hard} problems</span>
              </div>
              <progress className="progress progress-error w-full bg-base-300" value={data.difficulty.hard} max={totalProblems}></progress>
            </div>
          </div>
        </div>

        {/* 3. User Demographics */}
        <div className="bg-base-200 p-6 rounded-xl border border-base-content/10">
          <h2 className="text-lg font-semibold text-base-content mb-6">User Demographics</h2>
          
          <div className="space-y-4">
            {/* Standard Users */}
            <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg border border-base-content/10">
              <div className="flex items-center gap-3">
                <div className="bg-base-300 p-2 rounded-md text-base-content/60">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base-content font-medium">Standard Users</p>
                  <p className="text-xs text-base-content/50">{((data.demographics.standard / totalUsers) * 100).toFixed(1)}% of platform</p>
                </div>
              </div>
              <span className="text-xl font-bold text-base-content">{data.demographics.standard}</span>
            </div>

            {/* Administrators */}
            <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg border border-base-content/10">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 border border-primary/20 p-2 rounded-md text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base-content font-medium">Administrators</p>
                  <p className="text-xs text-base-content/50">{((data.demographics.admin / totalUsers) * 100).toFixed(1)}% of platform</p>
                </div>
              </div>
              <span className="text-xl font-bold text-base-content">{data.demographics.admin}</span>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;