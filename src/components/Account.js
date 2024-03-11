import { useEffect, useRef, useState } from "react";
import useAuth from "../hooks/useAuth";
import axios from "../api/axios";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Navbar from "./Navbar";
import Footer from "./FooterFull";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

const NAME_REGEX = /^(?=.{1,50}$)[a-z]+(?:['_.\s][a-z]+)*$/i;
const USERNAME_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const Account = () => {
  const { auth } = useAuth();
  const [user, setUser] = useState();

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const usernameRef = useRef();
  const emailRef = useRef();
  const errRef = useRef();

  const [firstName, setFirstName] = useState("");
  const [validFirstName, setValidFirstName] = useState(false);
  const [firstNameFocus, setFirstNameFocus] = useState(false);

  const [lastName, setLastName] = useState("");
  const [validLastName, setValidLastName] = useState(false);
  const [lastNameFocus, setLastNameFocus] = useState(false);

  const [username, setUsername] = useState("");
  const [validUsername, setValidUsername] = useState(false);
  const [usernameFocus, setUsernameFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");

  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    if (!user) {
      const USER_URL = `/users/email/${auth.email}`;

      const getUser = async () => {
        try {
          const response = await axios.get(USER_URL);
          console.log(response.data);
          setUser(response.data);
          setFirstName(response.data.first_name);
          setLastName(response.data.last_name);
          setUsername(response.data.username);
          setEmail(response.data.email);
        } catch (err) {
          console.error(err);
          if (!err?.response) {
            setErrMsg("No Server Response");
          } else if (err.response?.status === 404) {
            setErrMsg("User not found");
          } else {
            setErrMsg("Server Error");
          }
        }
      };

      getUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      firstNameRef.current.focus();
    }
  }, [user]);

  useEffect(() => {
    const result = NAME_REGEX.test(firstName);
    setValidFirstName(result);
  }, [firstName]);

  useEffect(() => {
    const result = NAME_REGEX.test(lastName);
    setValidLastName(result);
  }, [lastName]);

  useEffect(() => {
    const result = USERNAME_REGEX.test(username);
    setValidUsername(result);
  }, [username]);

  useEffect(() => {
    const result = EMAIL_REGEX.test(email);
    setValidEmail(result);
  }, [email]);

  useEffect(() => {
    const result = PWD_REGEX.test(pwd);
    setValidPwd(result);
    const match = pwd === matchPwd;
    setValidMatch(match);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [firstName, lastName, username, email, pwd, matchPwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if button enabled with JS hack
    const v1 = NAME_REGEX.test(firstName);
    const v2 = NAME_REGEX.test(lastName);
    const v3 = USERNAME_REGEX.test(username);
    const v4 = EMAIL_REGEX.test(email);
    const v5 = PWD_REGEX.test(pwd);
    if (!v1 || !v2 || !v3 || !v4 || !v5) {
      setErrMsg("Invalid Entry");
      return;
    }
    try {
      const UPDATE_URL = `/users/${user._id}`;

      await axiosPrivate.put(
        UPDATE_URL,
        JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username,
          email,
          password: pwd,
          confirm_password: matchPwd,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      navigate("/");
      setFirstName("");
      setLastName("");
      setUsername("");
      setEmail("");
      setPwd("");
      setMatchPwd("");
    } catch (err) {
      console.error(err);
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 409) {
        setErrMsg("Email Taken");
      } else {
        setErrMsg("Update Failed");
      }
      errRef.current.focus();
    }
  };

  return (
    <section>
      <Navbar />
      <div>
        <p
          ref={errRef}
          className={errMsg ? "errmsg" : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}
        </p>
        <h1>Account</h1>
        {user ? (
          <div>
            <form onSubmit={handleSubmit}>
              <label htmlFor="firstName">
                First Name:
                <FontAwesomeIcon
                  icon={faCheck}
                  className={validFirstName ? "valid" : "hide"}
                />
                <FontAwesomeIcon
                  icon={faTimes}
                  className={validFirstName || !firstName ? "hide" : "invalid"}
                />
              </label>
              <input
                type="text"
                id="firstName"
                ref={firstNameRef}
                autoComplete="off"
                onChange={(e) => setFirstName(e.target.value)}
                required
                aria-invalid={validFirstName ? "false" : "true"}
                aria-describedby="firstNameNote"
                onFocus={() => setFirstNameFocus(true)}
                onBlur={() => setFirstNameFocus(false)}
                value={firstName}
              />

              <p
                id="firstNameNote"
                className={
                  firstNameFocus && firstName && !validFirstName
                    ? "instructions"
                    : "offscreen"
                }
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                1 to 50 characters.
                <br />
                Must begin with a letter.
                <br />
                Only one space, underscore or dot between 2 words
              </p>

              <label htmlFor="lastName">
                Last Name:
                <FontAwesomeIcon
                  icon={faCheck}
                  className={validLastName ? "valid" : "hide"}
                />
                <FontAwesomeIcon
                  icon={faTimes}
                  className={validLastName || !lastName ? "hide" : "invalid"}
                />
              </label>
              <input
                type="text"
                id="lastName"
                ref={lastNameRef}
                autoComplete="off"
                onChange={(e) => setLastName(e.target.value)}
                required
                aria-invalid={validLastName ? "false" : "true"}
                aria-describedby="lastNameNote"
                onFocus={() => setLastNameFocus(true)}
                onBlur={() => setLastNameFocus(false)}
                value={lastName}
              />

              <p
                id="lastNameNote"
                className={
                  lastNameFocus && lastName && !validLastName
                    ? "instructions"
                    : "offscreen"
                }
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                1 to 50 characters.
                <br />
                Must begin with a letter.
                <br />
                Only one space, underscore or dot between 2 words
              </p>

              <label htmlFor="username">
                Username:
                <FontAwesomeIcon
                  icon={faCheck}
                  className={validUsername ? "valid" : "hide"}
                />
                <FontAwesomeIcon
                  icon={faTimes}
                  className={validUsername || !username ? "hide" : "invalid"}
                />
              </label>
              <input
                type="text"
                id="username"
                ref={usernameRef}
                autoComplete="off"
                onChange={(e) => setUsername(e.target.value)}
                required
                aria-invalid={validUsername ? "false" : "true"}
                aria-describedby="usernameNote"
                onFocus={() => setUsernameFocus(true)}
                onBlur={() => setUsernameFocus(false)}
                value={username}
              />

              <p
                id="usernameNote"
                className={
                  usernameFocus && username && !validUsername
                    ? "instructions"
                    : "offscreen"
                }
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                4 to 24 characters.
                <br />
                Must begin with a letter.
                <br />
                Letters, numbers, underscores, hyphens allowed.
              </p>

              <label htmlFor="email">
                Email:
                <FontAwesomeIcon
                  icon={faCheck}
                  className={validEmail ? "valid" : "hide"}
                />
                <FontAwesomeIcon
                  icon={faTimes}
                  className={validEmail || !email ? "hide" : "invalid"}
                />
              </label>
              <input
                type="email"
                id="email"
                ref={emailRef}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={validEmail ? "false" : "true"}
                aria-describedby="emailNote"
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                value={email}
              />

              <p
                id="emailNote"
                className={
                  emailFocus && email && !validEmail
                    ? "instructions"
                    : "offscreen"
                }
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                Must be a valid email
              </p>

              <label htmlFor="password">
                Password:
                <FontAwesomeIcon
                  icon={faCheck}
                  className={validPwd ? "valid" : "hide"}
                />
                <FontAwesomeIcon
                  icon={faTimes}
                  className={validPwd || !pwd ? "hide" : "invalid"}
                />
              </label>
              <input
                type="password"
                id="password"
                onChange={(e) => setPwd(e.target.value)}
                value={pwd}
                required
                aria-invalid={validPwd ? "false" : "true"}
                aria-describedby="pwdNote"
                onFocus={() => setPwdFocus(true)}
                onBlur={() => setPwdFocus(false)}
              />
              <p
                id="pwdNote"
                className={pwdFocus && !validPwd ? "instructions" : "offscreen"}
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                8 to 24 characters.
                <br />
                Must include uppercase and lowercase letters, a number and a
                special character.
                <br />
                Allowed special characters:{" "}
                <span aria-label="exclamation mark">!</span>{" "}
                <span aria-label="at symbol">@</span>{" "}
                <span aria-label="hashtag">#</span>{" "}
                <span aria-label="dollar sign">$</span>{" "}
                <span aria-label="percent">%</span>
              </p>

              <label htmlFor="confirm_pwd">
                Confirm Password:
                <FontAwesomeIcon
                  icon={faCheck}
                  className={validMatch && matchPwd ? "valid" : "hide"}
                />
                <FontAwesomeIcon
                  icon={faTimes}
                  className={validMatch || !matchPwd ? "hide" : "invalid"}
                />
              </label>
              <input
                type="password"
                id="confirm_pwd"
                onChange={(e) => setMatchPwd(e.target.value)}
                value={matchPwd}
                required
                aria-invalid={validMatch ? "false" : "true"}
                aria-describedby="confirmnote"
                onFocus={() => setMatchFocus(true)}
                onBlur={() => setMatchFocus(false)}
              />
              <p
                id="confirmnote"
                className={
                  matchFocus && !validMatch ? "instructions" : "offscreen"
                }
              >
                <FontAwesomeIcon icon={faInfoCircle} />
                Must match the first password input field.
              </p>

              <button
                disabled={
                  !validFirstName ||
                  !validLastName ||
                  !validUsername ||
                  !validEmail ||
                  !validPwd ||
                  !validMatch
                    ? true
                    : false
                }
              >
                Update
              </button>
            </form>
          </div>
        ) : (
          <p>No User to display</p>
        )}
      </div>
      <Footer />
    </section>
  );
};

export default Account;
