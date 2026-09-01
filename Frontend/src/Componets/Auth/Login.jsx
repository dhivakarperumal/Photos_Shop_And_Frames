import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../PrivateRouter/AuthContext";
import { getRoleHome } from "../../PrivateRouter/roleUtils";
import api from "../../api";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Award, Headset } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isAttemptingRef = useRef(false);

  const validate = () => {
    let newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Email Address is required";
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setErrors({ ...errors, [name]: "" });
    setServerError("");
  };

  // Auto-login when credentials (identifier + 6+ char password) are typed correctly
  useEffect(() => {
    const username = formData.username?.trim();
    const password = formData.password;

    if (!username || !password || password.length < 6 || submitted || isAttemptingRef.current) {
      return;
    }

    const timer = setTimeout(async () => {
      if (isAttemptingRef.current || submitted) return;
      isAttemptingRef.current = true;
      try {
        const { data } = await api.post("/users/login", {
          identifier: username,
          email: username,
          password: password,
        });

        if (data?.token && (data?.user || data?.data)) {
          setIsSubmitting(true);
          login(data.user || data.data, data.token);
          setSubmitted(true);
          navigate(getRoleHome(data.user?.role), { replace: true });
        }
      } catch {
        // Quietly fail during auto-type verification so typing is not interrupted
      } finally {
        isAttemptingRef.current = false;
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.username, formData.password, submitted, login, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    try {
      const { data } = await api.post("/users/login", {
        identifier: formData.username.trim(),
        email: formData.username.trim(),
        password: formData.password,
      });

      login(data.user || data.data, data.token);
      setSubmitted(true);
      navigate(getRoleHome(data.user?.role), { replace: true });
    } catch (error) {
      setServerError(error.response?.data?.message || error.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full flex font-sans overflow-hidden bg-[#f4f5f7]">
      {/* Left Panel */}
      <div 
        className="hidden lg:flex flex-col justify-between w-1/2 relative z-10 bg-black text-white px-14 py-12 h-full"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(17,19,23,0.95) 0%, rgba(17,19,23,0.8) 50%, rgba(17,19,23,0.95) 100%), url('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1200&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Top Logo */}
        <div className="flex items-center gap-4 mt-2">
          <div className="w-12 h-12 border border-[#d9b882] flex items-center justify-center relative flex-shrink-0">
             <span className="text-[#d9b882] font-serif text-xl absolute top-1 left-2">P</span>
             <span className="text-[#d9b882] font-serif text-xl absolute bottom-1 right-2">F</span>
          </div>
          <div className="flex flex-col">
             <span className="text-[#d9b882] text-2xl font-serif tracking-[0.15em] uppercase">PixelFrame</span>
             <div className="flex items-center gap-3 opacity-80 mt-1">
                <div className="h-px bg-[#d9b882] w-8"></div>
                <span className="text-[#d9b882] text-[10px] tracking-[0.25em] uppercase whitespace-nowrap">Frame your memories</span>
                <div className="h-px bg-[#d9b882] w-8"></div>
             </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="flex flex-col gap-3 max-w-lg mt-24 flex-1">
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-white mb-2 tracking-wide">
            Welcome Back!
          </h2>
          <p className="text-white text-2xl md:text-3xl font-serif mb-2">
            Sign in to continue
          </p>
          <p className="text-[#d9b882] text-3xl mt-2 italic font-light tracking-wide" style={{ fontFamily: "'Brush Script MT', 'Dancing Script', 'Pacifico', cursive" }}>
            Framing Moments, Creating Memories.
          </p>
        </div>

        {/* Bottom Features */}
        <div className="grid grid-cols-3 gap-6 pb-4 pt-10 border-t border-[#d9b882]/20 mt-16">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="text-[#d9b882]">
              <ShieldCheck size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-[#d9b882] font-medium mb-1 text-sm">Secure Login</h3>
              <p className="text-gray-300 text-xs px-2">Your data is safe with us</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="text-[#d9b882]">
              <Award size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-[#d9b882] font-medium mb-1 text-sm">Premium Quality</h3>
              <p className="text-gray-300 text-xs px-2">Best frames for your precious moments</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="text-[#d9b882]">
              <Headset size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-[#d9b882] font-medium mb-1 text-sm">24/7 Support</h3>
              <p className="text-gray-300 text-xs px-2">We're here to help you</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-4 lg:p-6 relative overflow-hidden">
        <div className="w-full max-w-[600px] bg-white p-7 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-20 flex flex-col overflow-hidden">

          {/* Floral decorations Top Right */}
          <svg className="absolute top-0 right-0 text-[#d9b882] w-28 h-28 opacity-30 rounded-tr-[2rem] pointer-events-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M70 0 Q60 30 80 50 T100 30" stroke="currentColor" strokeWidth="1" fill="none"/>
             <path d="M90 0 Q80 40 100 60" stroke="currentColor" strokeWidth="1" fill="none"/>
             <path d="M50 0 Q40 20 60 40 T90 20" stroke="currentColor" strokeWidth="0.75" fill="none"/>
             <path d="M85 10 Q75 15 80 25 T95 15" stroke="currentColor" strokeWidth="0.5" fill="none"/>
             <circle cx="80" cy="20" r="1.5" fill="currentColor"/>
             <circle cx="95" cy="40" r="1" fill="currentColor"/>
          </svg>

          {/* Floral decorations Bottom Left */}
          <svg className="absolute bottom-0 left-0 text-[#d9b882] w-20 h-20 opacity-30 rounded-bl-[2rem] pointer-events-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M0 100 Q30 90 50 70 T100 100" stroke="currentColor" strokeWidth="1" fill="none"/>
             <path d="M0 80 Q40 70 60 90" stroke="currentColor" strokeWidth="1" fill="none"/>
             <path d="M0 60 Q20 50 40 70 T70 90" stroke="currentColor" strokeWidth="0.75" fill="none"/>
             <circle cx="20" cy="80" r="1.5" fill="currentColor"/>
             <circle cx="40" cy="95" r="1" fill="currentColor"/>
          </svg>

          <div className="flex flex-col items-center mb-5 relative z-10">
            <div className="w-14 h-14 rounded-full bg-[#1f3b31] flex items-center justify-center mb-3 shadow-lg">
               <div className="relative w-7 h-7">
                  <span className="text-[#d9b882] font-serif text-lg absolute top-0 left-1">P</span>
                  <span className="text-[#d9b882] font-serif text-lg absolute bottom-0 right-1">F</span>
               </div>
            </div>
            <h2 className="text-[26px] font-serif font-bold text-[#1a3029] mb-1 tracking-tight">Login to PixelFrame</h2>
            <p className="text-gray-500 text-[13px]">Please enter your details to access your account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 relative z-10">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail size={17} strokeWidth={1.5} />
                </div>
                <input
                  type="email"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  autoComplete="username"
                  className={`w-full bg-white text-gray-800 text-sm border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:border-[#1a3029] focus:ring-1 focus:ring-[#1a3029] transition-all`}
                />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={17} strokeWidth={1.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full bg-white text-gray-800 text-sm border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg py-3 pl-11 pr-11 focus:outline-none focus:border-[#1a3029] focus:ring-1 focus:ring-[#1a3029] transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} strokeWidth={1.5} /> : <Eye size={17} strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="appearance-none w-4 h-4 rounded border border-gray-300 bg-white checked:bg-[#1a3029] checked:border-[#1a3029] cursor-pointer transition-colors"
                  />
                  {formData.rememberMe && (
                    <svg className="w-2.5 h-2.5 text-white absolute pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-[13px] text-gray-700 font-medium">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[13px] text-[#b48353] hover:text-[#9a6f44] font-medium transition-colors">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1f3b31] hover:bg-[#162a23] text-white text-[15px] font-medium py-3 rounded-lg flex items-center justify-center gap-2.5 transition-colors shadow-md disabled:opacity-70"
            >
              <Lock size={16} strokeWidth={2} />
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {serverError && <p className="text-red-500 text-sm text-center -mt-1">{serverError}</p>}
            {submitted && <p className="text-green-500 text-sm text-center -mt-1">✅ Login successful!</p>}

            {/* Divider */}
            <div className="relative flex items-center">
               <div className="flex-grow border-t border-gray-200"></div>
               <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">OR</span>
               <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[14px] font-semibold py-3 rounded-lg flex items-center justify-center gap-3 transition-colors shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Login with Google
            </button>

            <p className="text-center text-[14px] text-gray-500">
              Don't have an account? <Link to="/register" className="text-[#b48353] hover:text-[#9a6f44] font-semibold transition-colors">Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

