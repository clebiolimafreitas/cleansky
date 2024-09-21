// src/MutualFriends.js
import React, { useEffect, useState } from "react";
import "./MutualFriends.css";
import { useUser } from './UserContext';

const MutualFriends = () => {
  const { follows } = useUser();  
  const { followers } = useUser();  
  const [mutualFriends, setMutualFriends] = useState([]);  
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState("");    

  useEffect(() => {
    const fetchFollowsAndFollowers = async () => {
      setLoading(true);
      setError("");
      try {        
        const mutual = follows.filter(follow =>
          followers.some(follower => follower.did === follow.did)
        );
        setMutualFriends(mutual);
      } catch (error) {
        console.error("Erro ao carregar amigos mútuos:", error);
        setError("Erro ao carregar amigos mútuos.");
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    };

    fetchFollowsAndFollowers();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="mutual-friends-container">
      <h2>M&uacute;tuos</h2>
      <p className="mutual-friends-count">Total: {mutualFriends.length}</p>
      {mutualFriends.length > 0 ? (
        <ul className="mutual-friends-list">
          {mutualFriends.map(friend => (
            <li key={friend.did} className="friend-item">
              <img src={friend.avatar} alt={friend.displayName} className="friend-avatar" />
              <div>
                <p className="friend-name">{friend.displayName}</p>
                <p className="friend-handle">@{friend.handle}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum amigo mútuo encontrado.</p>
      )}
    </div>
  );
};

export default MutualFriends;
