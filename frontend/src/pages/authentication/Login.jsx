import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { loginUser, clearError } from '../../features/auth/authSlice';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error, isLoading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true }); 
    }
  }, [isAuthenticated, navigate]);

  // Clear global error when user leaves the component
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  const onSubmit = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      navigate('/', { replace: true });
    } catch (err) {
      console.log("Login Attempt Failed"); 
    }
  };

  return (
    <div className="min-h-screen bg-base-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-base-100 border border-base-content/10 rounded-2xl shadow-xl p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">Welcome Back</h1>
          <p className="text-base-content/70">Please enter your details to sign in</p>
        </div>
         
        {/* Global error message from Redux */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              className={`input w-full bg-base-200 border ${
                errors.email ? 'border-error focus:border-error' : 'border-base-content/20 focus:border-primary'
              } text-base-content placeholder-base-content/50 focus:outline-none`}
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Please enter a valid email address"
                }
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={`input w-full bg-base-200 border pr-10 ${
                  errors.password ? 'border-error focus:border-error' : 'border-base-content/20 focus:border-primary'
                } text-base-content placeholder-base-content/50 focus:outline-none`}
                {...register("password", { 
                  required: "Password is required" 
                })}
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content/80 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            // if loading then disable the button
            disabled={isLoading} 
            className="btn btn-primary w-full mt-6 shadow-lg transition-all"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        
        {/* Toggle to Signup */}
        <p className="text-center text-base-content/70 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:brightness-110 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;