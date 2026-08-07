import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

// 1. Updated Zod Schema matching the backend controller
const userRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['user', 'admin'], {
    required_error: 'Please select a role',
  })
});

const UserManagement = () => {
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 2. Initialize React Hook Form with new default values
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'user' 
    }
  });

  // 3. Handle Form Submission
  const onSubmit = async (data) => {
    setSubmitError('');
    setSuccessMessage('');

    try {
      // The 'data' object now perfectly matches: { firstName, lastName, email, password, role }
      console.log(data);
      const response = await axiosClient.post('/user/admin/register', data); 
      
      setSuccessMessage(`${data.firstName} ${data.lastName} has been successfully registered as an ${data.role}.`);
      reset(); // Clear the form after successful registration
      
    } catch (error) {
      console.error("Failed to register user:", error);
      // We can also catch the specific 400 error message from your controller (e.g., "Email is already registered.")
      setSubmitError(error.response?.data?.message || "Failed to register the new user. Please try again.");
    }
  };

  // Reusable Styling
  const inputClass = "input input-bordered w-full bg-base-100 border-base-content/20 text-base-content focus:border-primary focus:outline-none";

  return (
    <div className="space-y-6 text-base-content pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-primary" />
            User Management
          </h1>
          <p className="text-base-content/60 text-sm mt-1">Register new administrators or standard users to the platform.</p>
        </div>
      </div>

      {/* Alert Messages */}
      {submitError && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{submitError}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-success/10 border border-success/20 text-success p-4 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-base-200 max-w-2xl rounded-xl border border-base-content/10 shadow-xl overflow-hidden">
        
        <div className="p-6 border-b border-base-content/10 bg-base-300">
          <h2 className="text-lg font-semibold text-base-content">Account Details</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          {/* First Name & Last Name Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-control w-full">
              <label className="label"><span className="label-text text-base-content/60 font-medium">First Name</span></label>
              <input 
                type="text" 
                placeholder="John" 
                className={`${inputClass} ${errors.firstName ? 'border-error' : ''}`}
                {...register("firstName")} 
              />
              {errors.firstName && <span className="text-error text-xs mt-1">{errors.firstName.message}</span>}
            </div>

            <div className="form-control w-full">
              <label className="label"><span className="label-text text-base-content/60 font-medium">Last Name</span></label>
              <input 
                type="text" 
                placeholder="Doe" 
                className={`${inputClass} ${errors.lastName ? 'border-error' : ''}`}
                {...register("lastName")} 
              />
              {errors.lastName && <span className="text-error text-xs mt-1">{errors.lastName.message}</span>}
            </div>
          </div>

          {/* Email Field */}
          <div className="form-control w-full">
            <label className="label"><span className="label-text text-base-content/60 font-medium">Email Address</span></label>
            <input 
              type="email" 
              placeholder="e.g., john@example.com" 
              className={`${inputClass} ${errors.email ? 'border-error' : ''}`}
              {...register("email")} 
            />
            {errors.email && <span className="text-error text-xs mt-1">{errors.email.message}</span>}
          </div>

          {/* Password Field */}
          <div className="form-control w-full">
            <label className="label"><span className="label-text text-base-content/60 font-medium">Temporary Password</span></label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className={`${inputClass} ${errors.password ? 'border-error' : ''}`}
              {...register("password")} 
            />
            {errors.password && <span className="text-error text-xs mt-1">{errors.password.message}</span>}
          </div>

          {/* Role Selection */}
          <div className="form-control w-full mb-6">
            <label className="label">
              <span className="label-text text-base-content/60 font-medium">Platform Role</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              
              {/* Standard User Radio */}
              <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                errors.role ? 'border-error' : 'border-base-content/10 hover:bg-base-300'
              } has-checked:border-primary has-checked:bg-primary/10`}>
                <input 
                  type="radio" 
                  value="user" 
                  className="radio radio-primary radio-sm"
                  {...register("role")}
                />
                <div>
                  <p className="text-base-content font-medium text-sm">Standard User</p>
                  <p className="text-base-content/50 text-xs mt-0.5">Can solve problems.</p>
                </div>
              </label>

              {/* Administrator Radio */}
              <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                errors.role ? 'border-error' : 'border-base-content/10 hover:bg-base-300'
              } has-checked:border-error has-checked:bg-error/10`}>
                <input 
                  type="radio" 
                  value="admin" 
                  className="radio radio-error radio-sm"
                  {...register("role")}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-base-content font-medium text-sm">Administrator</p>
                    <Shield className="w-3.5 h-3.5 text-error" />
                  </div>
                  <p className="text-base-content/50 text-xs mt-0.5">Full platform access.</p>
                </div>
              </label>

            </div>
            {errors.role && <span className="text-error text-xs mt-2">{errors.role.message}</span>}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-base-content/10 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn btn-primary border-none px-8 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <><UserPlus className="w-4 h-4 mr-1" /> Register User</>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default UserManagement;