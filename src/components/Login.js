import { useRef, useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";

import axios from "../api/axios";
const LOGIN_URL = "/auth/login";

const Login = () => {
  const { setAuth, persist, setPersist } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const emailRef = useRef();
  const errRef = useRef();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");

  // Focus on first field
  useEffect(() => {
    emailRef.current.focus();
  }, []);

  // Get rid of error message once acknowledged
  useEffect(() => {
    setErrMsg("");
  }, [email, pwd]);

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Login
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ email, password: pwd }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      // Obtain access token and cookie. Token and other important information stored securely in auth context
      const accessToken = response?.data?.accessToken;
      setAuth({
        email,
        pwd,
        accessToken,
        fontIncrease: false,
        darkMode: false,
      });
      setEmail("");
      setPwd("");
      // Navigate to previous location if exists (which could have blocked entry due to the need to reauthenticate) or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg("Missing Email or Password");
      } else if (err.response?.status === 401) {
        setErrMsg("Unauthorized");
      } else {
        setErrMsg("Login Failed");
      }
    }
  };

  // Toggle whether to enable persistant login
  const togglePersist = () => {
    setPersist((prev) => !prev);
  };

  // Store persist in local storage
  useEffect(() => {
    localStorage.setItem("persist", persist);
  }, [persist]);

  return (
    <>
      <section className="loginContainer">
        <p
          ref={errRef}
          className={errMsg ? "errmsg" : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}
        </p>
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email:</label>
            <br />
            <input
              type="email"
              id="email"
              ref={emailRef}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <br />
            <input
              type="password"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
            />
          </div>
          <button>Sign In</button>
          <div className="persistCheck">
            <input
              type="checkbox"
              id="persist"
              onChange={togglePersist}
              checked={persist}
            />
            <label htmlFor="persist">Trust This Device</label>
          </div>
        </form>
        <br />
        <p>
          Need An Account?
          <br />
          <Link to="/register">Sign Up</Link>
        </p>
      </section>
      <Footer />
    </>
  );
};

export default Login;
