import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout(); // Chama a função de logout passada como prop
    }
    toggleMenu(); // Recolhe o menu após o logout
  };

  return (
    <nav className="navbar">
      <div className="menu-toggle" onClick={toggleMenu}>
        <FontAwesomeIcon icon={faCog} size="lg" />
      </div>
      <ul className={`nav-links ${isOpen ? "open" : ""}`}>
        <li>
          <Link to="/profile" onClick={toggleMenu}>Perfil</Link>
        </li>
        <li>
          <Link to="/follows" onClick={toggleMenu}>Seguindo</Link>
        </li>
        <li>
          <Link to="/followers" onClick={toggleMenu}>Seguidores</Link>
        </li>
        <li>
          <Link to="/mutualfriends" onClick={toggleMenu}>M&uacute;tuos</Link>
        </li>
        <li>
          <Link to="/nonfollowers" onClick={toggleMenu}>N&atilde;o Rec&iacute;procos</Link>
        </li>
        <li>
          <Link to="/followersnotfollowedback" onClick={toggleMenu}>N&atilde;o Seguidos</Link>
        </li>
        <li>
          <button onClick={handleLogout}>Logoff</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
