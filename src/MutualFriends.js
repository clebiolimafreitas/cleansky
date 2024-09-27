import React, { useEffect, useState } from "react";
import "./MutualFriends.css";
import { useUser } from './UserContext';
import { BskyAgent } from '@atproto/api';

const MutualFriends = () => {
  const { follows, setFollows } = useUser();  
  const { followers } = useUser();  
  const [mutualFriends, setMutualFriends] = useState([]);  
  const [filteredMutualFriends, setFilteredMutualFriends] = useState([]); 
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState("");    
  const [agent, setAgent] = useState(null);

  // Função para inicializar o agente da API BlueSky
  useEffect(() => {
    const initAgent = async () => {
      try {
        const newAgent = new BskyAgent({ service: 'https://bsky.social' });
        await newAgent.login({
          identifier: localStorage.getItem('username') + '.bsky.social',
          password: localStorage.getItem('password'),
        });
        setAgent(newAgent);
      } catch (error) {
        setError("Erro ao inicializar o agente.");
      }
    };

    initAgent();
  }, []);

  // Filtragem e obtenção dos amigos mútuos
  useEffect(() => {
    const fetchFollowsAndFollowers = () => {
      setLoading(true);
      setError("");
      try {
        const mutual = follows.filter(follow =>
          followers.some(follower => follower.did === follow.did)
        );
        setMutualFriends(mutual);
        setFilteredMutualFriends(mutual);
      } catch (error) {
        console.error("Erro ao carregar amigos mútuos:", error);
        setError("Erro ao carregar amigos mútuos.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowsAndFollowers();
  }, [follows, followers]);

  // Filtragem de amigos mútuos
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredMutualFriends(mutualFriends);
    } else {
      const filtered = mutualFriends.filter(friend =>
        friend.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
        friend.handle.toLowerCase().includes(searchText.toLowerCase()) ||
        (friend.description && friend.description.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredMutualFriends(filtered);
    }
  }, [searchText, mutualFriends]);

  // Função para desfazer follow
  const handleUnfollow = async (did) => {
    if (!agent) {
      console.error('Agent não inicializado.');
      return;
    }

    try {
      const { uri } = await agent.follow(did);
      await agent.deleteFollow(uri);
      setFollows(prev => prev.filter(follow => follow.did !== did));
      setMutualFriends(prev => prev.filter(friend => friend.did !== did));
    } catch (error) {
      console.error("Erro ao desfazer o follow:", error);
      setError("Erro ao desfazer o follow.");
    }
  };

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
      
      {/* Campo de filtro */}
      <input
        type="text"
        placeholder="Filtrar por nome, handle ou descri&ccedil;&atilde;o..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="search-input"
      />

      <p className="mutual-friends-count">Total: {filteredMutualFriends.length}</p>
      {filteredMutualFriends.length > 0 ? (
        <ul className="mutual-friends-list">
          {filteredMutualFriends.map(friend => (
            <li key={friend.did} className="friend-item">
              <img src={friend.avatar} alt={friend.displayName} className="friend-avatar" />
              <div className="friend-info">
                <p className="friend-name">{friend.displayName}</p>
                <p className="friend-handle">@{friend.handle}</p>
                {friend.description && <p className="friend-description">{friend.description}</p>}
              </div>
              <button 
                className="unfollow-button" 
                onClick={() => handleUnfollow(friend.did)}
              >
                Unfollow
              </button>
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
