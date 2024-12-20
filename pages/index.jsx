import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, RefreshCw } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isLogin) {
      // Signup validation
      if (formData.password !== formData.confirmPassword) {
        console.log('Passwords do not match');
        return;
      }
      if (!formData.agreedToTerms) {
        console.log('Must agree to terms and privacy policy');
        return;
      }
    }
    
    console.log('Form submitted:', formData);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-300 font-mono p-6">
      <div className="max-w-md mx-auto space-y-8 pt-8">
        {/* Header */}
         <h1 className="text-2xl mb-10">
         tiny journal
        </h1>
        <h1 className="text-2xl mb-12">
          {isLogin ? 'Welcome back.' : 'Create your account.'}
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Username Input - Only shown in signup */}
            {!isLogin && (
              <div className="bg-gray-800 p-4 rounded flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  name="username"
                  placeholder="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-transparent w-full focus:outline-none placeholder-gray-500"
                  required={!isLogin}
                />
              </div>
            )}

            {/* Email Input */}
            <div className="bg-gray-800 p-4 rounded flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <input
                type="email"
                name="email"
                placeholder="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-transparent w-full focus:outline-none placeholder-gray-500"
                required
              />
            </div>

            {/* Password Input */}
            <div className="bg-gray-800 p-4 rounded flex items-center space-x-3">
              <Lock className="w-5 h-5 text-gray-500" />
              <input
                type="password"
                name="password"
                placeholder="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-transparent w-full focus:outline-none placeholder-gray-500"
                required
              />
            </div>

            {/* Confirm Password Input - Only shown in signup */}
            {!isLogin && (
              <div className="bg-gray-800 p-4 rounded flex items-center space-x-3">
                <RefreshCw className="w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-transparent w-full focus:outline-none placeholder-gray-500"
                  required={!isLogin}
                />
              </div>
            )}
          </div>

          {/* Password Match Indicator - Only shown in signup */}
          {!isLogin && formData.password && formData.confirmPassword && (
            <div className="text-sm">
              {formData.password === formData.confirmPassword ? (
                <span className="text-green-400">passwords match</span>
              ) : (
                <span className="text-red-400">passwords do not match</span>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition-colors"
          >
            <span>{isLogin ? 'login' : 'create account'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Google Login/Signup */}
          <button
            type="button"
            className="w-full bg-gray-800 p-4 rounded flex items-center justify-between hover:bg-gray-700 transition-colors"
            onClick={() => console.log('Google auth clicked')}
          >
            <div className="flex items-center space-x-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{isLogin ? 'continue with google' : 'sign up with google'}</span>
            </div>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Terms and Privacy Checkbox - Only shown in signup */}
        {!isLogin && (
          <div className="flex items-start space-x-3 text-sm text-gray-500">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={(e) => handleChange({ target: { name: 'agreedToTerms', value: e.target.checked } })}
              className="mt-1 bg-gray-800 border-gray-700 rounded focus:ring-0 focus:ring-offset-0 cursor-pointer"
              required={!isLogin}
            />
            <label className="cursor-pointer">
              I agree to the
              <button type="button" className="text-gray-400 hover:text-gray-300 mx-1">terms of service</button>
              and
              <button type="button" className="text-gray-400 hover:text-gray-300 mx-1">privacy policy</button>
            </label>
          </div>
        )}

        {/* Toggle Login/Signup */}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setFormData({
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
              agreedToTerms: false
            });
          }}
          className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
        >
          {isLogin ? 'need an account? sign up' : 'already have an account? login'}
        </button>


      </div>
    </div>
  );
};

export default Login;