import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, X, CheckCircle, AlertTriangle, XCircle, Wifi, WifiOff } from 'lucide-react';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';

  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(''); // 'validation', 'network', 'server', 'auth'
  const [fieldErrors, setFieldErrors] = useState({}); // Field-specific errors
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalEmail, setModalEmail] = useState('');
  const [actionType, setActionType] = useState(''); // 'signup' or 'signin'

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect only after sign-in
  useEffect(() => {
    if (user && actionType === 'signin') {
      navigate('/dashboard');
    }
  }, [user, navigate, actionType]);

  // Enhanced error handling function
  const setErrorWithType = (message, type = 'server') => {
    setError(message);
    setErrorType(type);
    
    // Auto-dismiss validation errors after 5 seconds
    if (type === 'validation') {
      setTimeout(() => {
        setError('');
        setErrorType('');
      }, 5000);
    }
  };

  const clearError = () => {
    setError('');
    setErrorType('');
    setFieldErrors({});
  };

  // Real-time field validation
  const validateField = (fieldName, value) => {
    const newFieldErrors = { ...fieldErrors };
    
    switch (fieldName) {
      case 'email':
        if (value && !/\S+@\S+\.\S+/.test(value)) {
          newFieldErrors.email = 'Please enter a valid email address';
        } else {
          delete newFieldErrors.email;
        }
        break;
      case 'password':
        if (value && value.length < 6) {
          newFieldErrors.password = 'Password must be at least 6 characters long';
        } else {
          delete newFieldErrors.password;
        }
        break;
      case 'confirmPassword':
        if (value && password && value !== password) {
          newFieldErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newFieldErrors.confirmPassword;
        }
        break;
      case 'fullName':
        if (isSignUp && value && !value.trim()) {
          newFieldErrors.fullName = 'Please enter your full name';
        } else {
          delete newFieldErrors.fullName;
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(newFieldErrors);
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
  };

  const validateForm = () => {
    if (!email || !password) {
      setErrorWithType('Please fill in all required fields', 'validation');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorWithType('Please enter a valid email address', 'validation');
      return false;
    }
    if (password.length < 6) {
      setErrorWithType('Password must be at least 6 characters long', 'validation');
      return false;
    }
    if (isSignUp) {
      if (!fullName.trim()) {
        setErrorWithType('Please enter your full name', 'validation');
        return false;
      }
      if (password !== confirmPassword) {
        setErrorWithType('Passwords do not match', 'validation');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    clearError();

    try {
      if (isSignUp) {
        setActionType('signup');
        const { data, error } = await signUp(email, password, { full_name: fullName });
        if (error) {
          // Handle different types of signup errors
          if (error.message.includes('email')) {
            if (error.message.includes('already registered') || error.message.includes('already exists')) {
              setErrorWithType('An account with this email already exists. Please sign in instead.', 'auth');
            } else if (error.message.includes('invalid') || error.message.includes('format')) {
              setErrorWithType('Please enter a valid email address.', 'validation');
            } else {
              setErrorWithType('Email-related error: ' + error.message, 'auth');
            }
          } else if (error.message.includes('password')) {
            setErrorWithType('Password error: ' + error.message, 'validation');
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            setErrorWithType('Network error. Please check your connection and try again.', 'network');
          } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
            setErrorWithType('Too many attempts. Please wait a moment and try again.', 'server');
          } else {
            setErrorWithType(error.message || 'Failed to create account. Please try again.', 'server');
          }
        } else {
          setModalEmail(email);
          setShowModal(true);
          clearForm();
        }
      } else {
        setActionType('signin');
        const { data, error } = await signIn(email, password);
        if (error) {
          // Handle different types of signin errors
          if (error.message.includes('Invalid login credentials') || error.message.includes('invalid credentials')) {
            setErrorWithType('Invalid email or password. Please check your credentials and try again.', 'auth');
          } else if (error.message.includes('email not confirmed') || error.message.includes('not verified')) {
            setErrorWithType('Please verify your email address before signing in. Check your inbox for a verification link.', 'auth');
          } else if (error.message.includes('password')) {
            setErrorWithType('Password error: ' + error.message, 'auth');
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            setErrorWithType('Network error. Please check your connection and try again.', 'network');
          } else if (error.message.includes('rate limit') || error.message.includes('too many')) {
            setErrorWithType('Too many sign-in attempts. Please wait a moment and try again.', 'server');
          } else {
            setErrorWithType(error.message || 'Failed to sign in. Please try again.', 'server');
          }
        } else {
          // No need to navigate here, useEffect will handle it
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrorWithType('An unexpected error occurred. Please try again later.', 'network');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced error display component
  const ErrorDisplay = ({ error, errorType, onClose }) => {
    if (!error) return null;

    const getErrorConfig = (type) => {
      switch (type) {
        case 'validation':
          return {
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            textColor: 'text-yellow-800',
            icon: AlertTriangle,
            iconColor: 'text-yellow-500'
          };
        case 'network':
          return {
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            icon: WifiOff,
            iconColor: 'text-blue-500'
          };
        case 'auth':
          return {
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
            icon: XCircle,
            iconColor: 'text-red-500'
          };
        case 'server':
        default:
          return {
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
            icon: AlertTriangle,
            iconColor: 'text-red-500'
          };
      }
    };

    const config = getErrorConfig(errorType);
    const IconComponent = config.icon;

    return (
      <div className={`mb-4 p-4 ${config.bgColor} ${config.borderColor} border rounded-lg animate-pulse`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${config.textColor}`}>
              {error}
            </p>
            {errorType === 'validation' && (
              <p className="text-xs text-gray-600 mt-1">
                This message will disappear automatically in a few seconds.
              </p>
            )}
          </div>
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md p-1.5 ${config.textColor} hover:${config.bgColor} focus:outline-none`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const closeModal = () => {
    setShowModal(false);
    setModalEmail('');
    setIsSignUp(false);
    setActionType(null);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    clearForm();
    clearError();
  };

  const resendEmail = async () => {
    if (!modalEmail) return;
    setIsLoading(true);
    try {
      await signUp(modalEmail, 'dummy', {});
    } catch (error) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Account Created Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                We've sent a verification email to:
              </p>
              <p className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded border mb-4">
                {modalEmail}
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Please check your email and click the verification link to activate your account.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={closeModal}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Got it, take me to login
                </button>
                
                <button
                  onClick={resendEmail}
                  disabled={isLoading}
                  className="w-full border border-indigo-300 text-indigo-700 py-2 px-4 rounded-md hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Resend Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showModal && (
        <>
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center mb-6">
              <Link to="/" className="flex items-center text-sm text-gray-600 hover:text-indigo-600">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </Link>
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
            </div>

            <h2 className="text-center text-3xl font-bold text-gray-900">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isSignUp ? 'Start building amazing projects today' : 'Welcome back to Buildsy'}
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <ErrorDisplay 
                error={error} 
                errorType={errorType} 
                onClose={clearError} 
              />

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignUp && (
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      isSignUp ? 'Create Account' : 'Sign In'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={toggleMode}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuthPage;
