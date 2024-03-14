import { Link } from "react-router-dom";

const Missing = () => {
  return (
    <section>
      <h1>Oops!</h1>
      <p>Page Not Found</p>
      <div>
        <Link to="/">Visit Dashboard</Link>
      </div>
    </section>
  );
};

export default Missing;
