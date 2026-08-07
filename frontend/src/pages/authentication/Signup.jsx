import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router'; 
import { registerUser, clearError } from '../../features/auth/authSlice';
import { Eye, EyeOff } from 'lucide-react';

//Define the Zod Validation Schema
const signupSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),  
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], 
});


const SignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, error, isLoading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });
    
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
  
  // 3. Handle Form Submission
  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    try {
      await dispatch(registerUser(userData)).unwrap();
      navigate('/', { replace: true });
    } catch (err) {
      console.log("Registration Attempt Failed");
    }
  };

  return (
    <div className="min-h-screen bg-base-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-base-100 border border-base-content/10 rounded-2xl shadow-xl p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">Create Account</h1>
          <p className="text-base-content/70">Join us to get started</p>
        </div>

        {/* Global error message from redux */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* First Name & Last Name Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="First Name"
                className={`input w-full bg-base-200 border ${
                  errors.firstName ? 'border-error focus:border-error' : 'border-base-content/20 focus:border-primary'
                } text-base-content placeholder-base-content/50 focus:outline-none`}
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.firstName.message}</p>
              )}
            </div>

            <div className="flex-1">
              <input
                type="text"
                placeholder="Last Name"
                className={`input w-full bg-base-200 border ${
                  errors.lastName ? 'border-error focus:border-error' : 'border-base-content/20 focus:border-primary'
                } text-base-content placeholder-base-content/50 focus:outline-none`}
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              className={`input w-full bg-base-200 border ${
                errors.email ? 'border-error focus:border-error' : 'border-base-content/20 focus:border-primary'
              } text-base-content placeholder-base-content/50 focus:outline-none`}
              {...register("email")}
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
                {...register("password")}
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

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className={`input w-full bg-base-200 border pr-10 ${
                  errors.confirmPassword ? 'border-error focus:border-error' : 'border-base-content/20 focus:border-primary'
                } text-base-content placeholder-base-content/50 focus:outline-none`}
                {...register("confirmPassword")}
              />
              
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content/80 focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full mt-6 shadow-lg transition-all"
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-center text-base-content/70 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:brightness-110 font-medium transition-colors" >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;