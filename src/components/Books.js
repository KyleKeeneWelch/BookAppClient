import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "../api/axios";
import {
  faChevronRight,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "./Navbar";
import Footer from "./FooterFull";

const Books = () => {
  let { search } = useParams();
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState([]);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const LIMIT = 20;

  // Get paginated books
  useEffect(() => {
    const BOOKS_URL = `/books?page=${page}&limit=${LIMIT}&search=${search}`;

    const getBooks = async () => {
      try {
        // Get books and assign whether current selection has a next and previous page
        const response = await axios.get(BOOKS_URL);
        response.data?.previous ? setHasPrevious(true) : setHasPrevious(false);
        response.data?.next ? setHasNext(true) : setHasNext(false);
        setBooks(response.data.results);
      } catch (err) {
        console.error(err);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    getBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  return (
    <>
      <Navbar />
      <section className="booksContainer">
        <br />
        <h1>Books</h1>
        <div>
          {books?.length ? (
            books.map((book, i) => (
              <div key={i}>
                <Link to={`../book/${book._id}`}>
                  <img src={book.thumbnail} alt="Book Thumbnail" />
                  <h3>{book?.title}</h3>
                </Link>
              </div>
            ))
          ) : (
            <p>No Results</p>
          )}
        </div>
        <br />
        <div>
          <p>Page {page}</p>
          <br />
          <div>
            {hasPrevious && (
              <button onClick={() => setPage(page - 1)}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
            )}
            {hasNext && books?.length > 0 && (
              <button onClick={() => setPage(page + 1)}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Books;
