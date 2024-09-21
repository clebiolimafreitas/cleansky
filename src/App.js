import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Login from "./Login";
import Follows from "./Follows";
import Followers from "./Followers";
import Profile from "./Profile";
import MutualFriends from "./MutualFriends";
import Navbar from "./Navbar";  
import NonFollowers from "./NonFollowers";
import FollowersNotFollowedBack from "./FollowersNotFollowedBack";
import { UserProvider } from './UserContext';

function App() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('username'); // Remover o username do localStorage
    // Redirecionar para a tela de login, se necessário
    window.location.href = "/login"; // Redireciona para a tela de login
  };

  return (
    <>
      <UserProvider>
        {!location.pathname.includes('/login') && <Navbar onLogout={handleLogout} />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mutualfriends" element={<MutualFriends />} />
          <Route path="/follows" element={<Follows />} />
          <Route path="/followers" element={<Followers />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/nonfollowers" element={<NonFollowers />} />
          <Route path="/followersnotfollowedback" element={<FollowersNotFollowedBack />} />
        </Routes>
      </UserProvider>
    </>
  );
}

const Wrapper = () => (
  <Router>
    <App />
  </Router>
);

export default Wrapper;