import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router'; 
import axiosClient from '../../utils/axiosClient';
import problemSchema from '../../validations/problemSchema'; 

const UpdateProblem = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');

  // 1. Initialize React Hook Form
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'Easy',
      topics: '',
      constraints: '',
    }
  });



  // 3. Fetch Existing Data on Mount
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data } = await axiosClient.get(`/problem/${problemId}`);
        const problem = data.problem;

        reset({
          title: problem.title || '',
          difficulty: problem.difficulty || 'Easy',
          topics: problem.topics ? problem.topics.join(', ') : '',
          description: problem.description || '',
          constraints: problem.constraints ? problem.constraints.join('\n') : '',
        });
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching problem:", err);
        setSubmitError("Failed to load problem data. It may have been deleted.");
        setIsLoading(false);
      }
    };

    fetchProblem();
  }, [problemId, reset]);

  // 4. Handle Form Submission (PUT Request)
  const onSubmit = async (data) => {
    setSubmitError('');
    try {
      const payload = {
        ...data,
        topics: data.topics.split(',').map(topic => topic.trim()).filter(t => t !== ''),
        constraints: data.constraints.split('\n').map(c => c.trim()).filter(c => c !== '')
      };

      await axiosClient.put(`/problem/${problemId}`, payload); 
      navigate('/admin/problems'); 
      
    } catch (error) {
      console.error("Failed to update problem:", error);
      setSubmitError(error.response?.data?.message || "An unexpected error occurred.");
    }
  };

  // Reusable Input Styling
  const inputClass = "input input-bordered w-full bg-base-100 border-base-content/20 text-base-content focus:border-primary focus:outline-none";
  const textareaClass = "textarea textarea-bordered w-full bg-base-100 border-base-content/20 text-base-content focus:border-primary focus:outline-none font-mono min-h-[150px]";
  const cardClass = "bg-base-200 p-6 rounded-xl border border-base-content/10 shadow-xl mb-6";
  


  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-300 flex items-center justify-center">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-300 text-base-content py-10 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Update Problem</h1>
            <p className="text-base-content/60 mt-1">Modify existing problem details</p>
          </div>
          <button onClick={() => navigate('/admin/problems')} className="btn btn-outline border-base-content/20 text-base-content hover:bg-base-200 hover:text-base-content">
            Cancel
          </button>
        </div>

        {submitError && (
          <div className="bg-error/10 border border-error text-error p-4 rounded-lg mb-6">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* --- BASIC INFO SECTION --- */}
          <div className={cardClass}>
            <h2 className="text-xl font-semibold text-base-content mb-4 border-b border-base-content/10 pb-2">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label text-sm text-base-content/60">Problem Title</label>
                <input type="text" className={inputClass} {...register("title")} />
                {errors.title && <span className="text-error text-xs">{errors.title.message}</span>}
              </div>
              
              <div>
                <label className="label text-sm text-base-content/60">Difficulty</label>
                <select className={`select select-bordered w-full bg-base-100 border-base-content/20 text-base-content focus:border-primary focus:outline-none`} {...register("difficulty")}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                {errors.difficulty && <span className="text-error text-xs">{errors.difficulty.message}</span>}
              </div>
            </div>

            <div className="mb-4">
              <label className="label text-sm text-base-content/60">Topics (Comma separated)</label>
              <input type="text" className={inputClass} {...register("topics")} />
              {errors.topics && <span className="text-error text-xs">{errors.topics.message}</span>}
            </div>

            <div className="mb-4">
              <label className="label text-sm text-base-content/60">Description</label>
              <textarea className={textareaClass} {...register("description")}></textarea>
              {errors.description && <span className="text-error text-xs">{errors.description.message}</span>}
            </div>

            <div>
              <label className="label text-sm text-base-content/60">Constraints (One per line)</label>
              <textarea rows="3" className={`textarea textarea-bordered w-full bg-base-100 border-base-content/20 text-base-content focus:border-primary focus:outline-none font-mono`} {...register("constraints")}></textarea>
              {errors.constraints && <span className="text-error text-xs">{errors.constraints.message}</span>}
            </div>
          </div>

   



          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4 pb-10">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn btn-primary shadow-lg shadow-primary/30 w-full sm:w-auto"
            >
              {isSubmitting ? <span className="loading loading-spinner"></span> : "Update Problem"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default UpdateProblem;