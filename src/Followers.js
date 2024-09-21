import React, { useState} from "react";
import "./Followers.css";
import { useUser } from './UserContext';

const Followers = () => {
  const {followers} = useUser();  
  const [error, setError] = useState(""); 

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="followers-container">
      <h2>Seguidores</h2>
      <p className="follows-count">Total: {followers.length}</p>    
      {error && <p className="error">{error}</p>}      
      <div className="followers-list">
        {followers.length === 0 && <p>Você ainda não tem seguidores.</p>}
        {followers.map((follower) => (
          <div key={follower.did} className="follower-item">
            <img src={follower.avatar} alt={follower.displayName} className="avatar" />
            <div className="follower-info">
              <p className="display-name">{follower.displayName}</p>
              <p className="handle">@{follower.handle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );  
};

export default Followers;
