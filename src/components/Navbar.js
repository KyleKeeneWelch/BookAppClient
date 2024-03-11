import { Link, useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

const SEARCH_MAX = 200;

const Navbar = () => {
  const logout = useLogout();
  const navigate = useNavigate();

  const searchRef = useRef();
  const errRef = useRef();

  const [search, setSearch] = useState("");
  const [validSearch, setValidSearch] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    setValidSearch(search.length <= SEARCH_MAX && search.length > 0);
  }, [search]);

  useEffect(() => {
    setErrMsg("");
  }, [search]);

  const signOut = async () => {
    await logout();
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if button enabled with JS hack
    const v1 = search.length <= SEARCH_MAX && search.length > 0;

    if (!v1) {
      setErrMsg("Invalid Entry");
      return;
    }

    navigate(`../books/${search}`, { replace: true });
  };

  return (
    <section>
      <div>
        <Link to="/">
          <img src="/assets/Insight_small.png" alt="Insight Logo" />
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
          />
          <button type="submit" disabled={!validSearch ? true : false}>
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
            searchFocus && search && !validSearch ? "instructions" : "offscreen"
          }
        >
          <FontAwesomeIcon icon={faInfoCircle} />
          Search is required and must be below 200 characters
        </p>
      </div>
      <Link to="/">Dashboard</Link>
      <Link to="../books">View Books</Link>
      <Link to="../reviews/create">Create Review</Link>
      <Link to="../account">Account</Link>
      <button onClick={signOut}>Sign Out</button>
    </section>
  );
};

export default Navbar;
