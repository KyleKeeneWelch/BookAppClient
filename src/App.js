import Account from "./components/Account";
import Book from "./components/Book";
import Books from "./components/Books";
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Missing from "./components/Missing";
import PersistLogin from "./components/PersistLogin";
import Register from "./components/Register";
import RequireAuth from "./components/RequireAuth";
import Review from "./components/Review";
import CreateReview from "./components/CreateReview";
import Unauthorized from "./components/Unauthorized";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* we want to protect these routes */}
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="account" element={<Account />} />
            {/* Find a way to provide id for book */}
            <Route path="books/:bookId" element={<Book />} />
            <Route path="books" element={<Books />} />
            {/* Find a way to provide id for book */}
            <Route path="reviews/:reviewId" element={<Review />} />
            <Route path="reviews/create" element={<CreateReview />} />
          </Route>
        </Route>

        {/* catch all */}
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}

export default App;
