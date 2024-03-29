import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopyright } from "@fortawesome/free-solid-svg-icons";

const Footer = () => {
  return (
    <footer className="footerFull">
      <div className="footerTop">
        <div>
          <Link to="/">
            <img
              src="../../assets/Insight_small.png"
              alt="Insight Logo"
              width={200}
              height={100}
              className="footerLogo"
            />
          </Link>
        </div>
        <div>
          <p>
            Find your favorite books, create reviews and receive targeted
            recommendations to fit your profile! Collaborate with other
            insightful readers on the hottest and most breathtaking stories yet!
          </p>
        </div>
        <div>
          <div>
            <img
              src="../../assets/facebook.png"
              alt="Facebook logo"
              width={24}
              height={24}
            />
          </div>
          <div>
            <img src="../../assets/x.png" alt="X logo" width={24} height={24} />
          </div>
          <div>
            <img
              src="../../assets/instagram.png"
              alt="Instagram logo"
              width={24}
              height={24}
            />
          </div>
        </div>
        <div className="footerLinks">
          <Link to="/">Dashboard</Link>
          <Link to="/books">View Books</Link>
          <Link to="/reviews/create">Create Review</Link>
          <Link to="/account">Account</Link>
        </div>
      </div>
      <div className="footerBottom">
        <p>
          <FontAwesomeIcon icon={faCopyright} />
          Copyright 2024. All rights reserved.
        </p>
        <Link to="#">Terms & Conditions</Link>
      </div>
    </footer>
  );
};

export default Footer;
