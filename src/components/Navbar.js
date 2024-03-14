import { Link, useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faMagnifyingGlass,
  faBars,
  faUser,
  faHome,
  faBook,
  faSquarePlus,
  faRightFromBracket,
  faGear,
  faFont,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import useWindowDimensions from "../hooks/useWindowDimensions";
import useAuth from "../hooks/useAuth";

const SEARCH_MAX = 200;

const Navbar = () => {
  const { auth, setAuth } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  const searchRef = useRef();
  const errRef = useRef();

  const [search, setSearch] = useState("");
  const [validSearch, setValidSearch] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  const [showNavModal, setShowNavModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const { height, width } = useWindowDimensions();

  const [errMsg, setErrMsg] = useState("");

  // Test input in real time
  useEffect(() => {
    setValidSearch(search.length <= SEARCH_MAX && search.length > 0);
  }, [search]);

  // Get rid of error after acknowledged
  useEffect(() => {
    setErrMsg("");
  }, [search]);

  // Handle sign out
  const signOut = async () => {
    await logout();
    navigate("/login");
  };

  // Handle book search
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If button enabled with JS hack
    const v1 = search.length <= SEARCH_MAX && search.length > 0;

    if (!v1) {
      setErrMsg("Invalid Entry");
      return;
    }

    // Navigate to books page with search
    navigate(`../books/${search}`, { replace: true });
  };

  // When the window is resized and accessbility font option is selected, adjust the size variables
  useEffect(() => {
    const root = document.querySelector(":root");
    const width = window.innerWidth;

    if (auth.fontIncrease && width > 500) {
      root.style.setProperty("--text-size", "22px");
      root.style.setProperty("--h1-size", "2.5em");
      root.style.setProperty("--h2-size", "2em");
      root.style.setProperty("--h3-size", "1.5em");
      root.style.setProperty("--grid-size", "300px");
    } else if (auth.fontIncrease && width <= 500) {
      root.style.setProperty("--text-size", "18px");
      root.style.setProperty("--h1-size", "2em");
      root.style.setProperty("--h2-size", "1.5em");
      root.style.setProperty("--h3-size", "1em");
      root.style.setProperty("--grid-size", "300px");
    } else if (!auth.fontIncrease && width > 500) {
      root.style.setProperty("--text-size", "18px");
      root.style.setProperty("--h1-size", "2em");
      root.style.setProperty("--h2-size", "1.5em");
      root.style.setProperty("--h3-size", "1em");
      root.style.setProperty("--grid-size", "280px");
    } else if (!auth.fontIncrease && width <= 500) {
      root.style.setProperty("--text-size", "16px");
      root.style.setProperty("--h1-size", "2em");
      root.style.setProperty("--h2-size", "1.5em");
      root.style.setProperty("--h3-size", "1em");
      root.style.setProperty("--grid-size", "280px");
    }
  }, [auth, width]);

  // When the darkmode accessibility option is selected, adjust the color variables
  useEffect(() => {
    const root = document.querySelector(":root");
    if (auth.darkMode) {
      root.style.setProperty("--color-main", "#282872");
      root.style.setProperty("--color-secondary", "#0d0d28");
    } else {
      root.style.setProperty("--color-main", "rgb(83, 83, 206)");
      root.style.setProperty("--color-secondary", "#282872");
    }
  }, [auth]);

  return (
    <>
      <nav>
        <div>
          <Link to="/">
            <img
              src="/assets/Insight_small.png"
              alt="Insight Logo"
              height="96"
              width="192"
            />
          </Link>
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="search"
              ref={searchRef}
              autoComplete="on"
              onChange={(e) => setSearch(e.target.value)}
              required
              aria-invalid={validSearch ? "false" : "true"}
              aria-describedby="searchNote"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder="Fiction..."
            />
            <button
              className="navButton"
              type="submit"
              disabled={!validSearch ? true : false}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </form>
          <p
            ref={errRef}
            className={errMsg ? "errmsg" : "offscreen"}
            aria-live="assertive"
          >
            {errMsg}
          </p>
          <p
            id="searchNote"
            className={
              searchFocus && search && !validSearch
                ? "instructions"
                : "offscreen"
            }
          >
            <FontAwesomeIcon icon={faInfoCircle} />
            Search is required and must be below 200 characters
          </p>
        </div>
        <div>
          <button
            className="navButton"
            onClick={() => setShowNavModal(!showNavModal)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        <div>
          <Link to="/">Dashboard</Link>
          <Link to="../books">View Books</Link>
          <Link to="../reviews/create">Create Review</Link>
          <Link to="../account">Account</Link>
          <button
            className="navButton"
            onClick={() => setShowSettingsModal(!showSettingsModal)}
          >
            Settings
          </button>
          <button className="navButton" onClick={signOut}>
            Sign Out
          </button>
        </div>
        <div>
          <Link to="/">
            <FontAwesomeIcon icon={faHome} />
          </Link>
          <Link to="../books">
            <FontAwesomeIcon icon={faBook} />
          </Link>
          <Link to="../reviews/create">
            <FontAwesomeIcon icon={faSquarePlus} />
          </Link>
          <Link to="../account">
            <FontAwesomeIcon icon={faUser} />
          </Link>
          <button
            className="navButton"
            onClick={() => setShowSettingsModal(!showSettingsModal)}
          >
            <FontAwesomeIcon icon={faGear} />
          </button>
          <button className="navButton" onClick={signOut}>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>
      </nav>

      {(showNavModal || showSettingsModal) && (
        <div
          className="backdrop"
          onClick={() => {
            setShowNavModal(false);
            setShowSettingsModal(false);
          }}
        ></div>
      )}

      {showNavModal && (
        <div className="modal navModal">
          <div className="navigationContainer">
            <h1>Navigation</h1>
            <Link to="/">
              Dashboard
              <FontAwesomeIcon icon={faHome} />
            </Link>
            <Link to="../books">
              View Books
              <FontAwesomeIcon icon={faBook} />
            </Link>
            <Link to="../reviews/create">
              Create Review
              <FontAwesomeIcon icon={faSquarePlus} />
            </Link>
            <Link to="../account">
              Account
              <FontAwesomeIcon icon={faUser} />
            </Link>
            <button
              className="navButton"
              onClick={() => {
                setShowSettingsModal(!showSettingsModal);
                setShowNavModal(false);
              }}
            >
              Settings
              <FontAwesomeIcon icon={faGear} />
            </button>
            <button className="navButton" onClick={signOut}>
              Sign Out
              <FontAwesomeIcon icon={faRightFromBracket} />
            </button>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="modal settingsModal">
          <h1>Settings</h1>
          <br />
          <br />
          <div className="accessibilityContainer">
            <h2>Accessibility</h2>
            <div>
              <input
                type="checkbox"
                onChange={() =>
                  setAuth({ ...auth, fontIncrease: !auth.fontIncrease })
                }
                checked={auth.fontIncrease ? true : false}
              />
              <p>Increase Font Sizes</p>
              <FontAwesomeIcon icon={faFont} />
            </div>
            <div>
              <input
                type="checkbox"
                onChange={() => setAuth({ ...auth, darkMode: !auth.darkMode })}
                checked={auth.darkMode ? true : false}
              />
              <p>{auth.darkMode ? "Disable" : "Enable"} Darkmode</p>
              {auth.darkMode ? (
                <FontAwesomeIcon icon={faMoon} />
              ) : (
                <FontAwesomeIcon icon={faSun} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
