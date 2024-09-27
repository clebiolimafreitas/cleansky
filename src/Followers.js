import React, { useState, useEffect } from "react";
import "./Followers.css";
import { useUser } from './UserContext';
import { BskyAgent } from '@atproto/api';

const Followers = () => {
  const { followers, follows, setFollows } = useUser();
  const [filteredFollowers, setFilteredFollowers] = useState(followers);
  const [searchText, setSearchText] = useState("");
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

  // Função de filtragem
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredFollowers(followers);
    } else {
      const filtered = followers.filter(follower =>
        follower.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
        follower.handle.toLowerCase().includes(searchText.toLowerCase()) ||
        (follower.description && follower.description.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredFollowers(filtered);
    }
  }, [searchText, followers]);

  // Verifica se o usuário já segue
  const isFollowing = (did) => {
    return follows.some(follow => follow.did === did);
  };

  // Função para seguir
  const handleFollow = async (did) => {
    if (!agent) {
      console.error('Agent não inicializado.');
      return;
    }

    try {
      const { uri } = await agent.follow(did);
      setFollows(prev => [...prev, { did }]);  // Atualiza a lista de follows localmente
    } catch (error) {
      console.error("Erro ao seguir:", error);
      setError("Erro ao seguir.");
    }
  };

  // Função para deixar de seguir
  const handleUnfollow = async (did) => {
    if (!agent) {
      console.error('Agent não inicializado.');
      return;
    }

    try {
      const follow = follows.find(follow => follow.did === did);
      if (follow) {
        const { uri } = await agent.follow(follow.did); // Buscando uri
        await agent.deleteFollow(uri);
        setFollows(prev => prev.filter(f => f.did !== did));  // Remove o seguidor da lista
      }
    } catch (error) {
      console.error("Erro ao deixar de seguir:", error);
      setError("Erro ao deixar de seguir.");
    }
  };

  return (
    <div className="followers-container">
      <h2>Seguidores</h2>

      {/* Campo de filtro */}
      <input
        type="text"
        placeholder="Filtrar por nome, handle ou descri&ccedil;&atilde;o..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="search-input"
      />

      <p className="follows-count">Total: {filteredFollowers.length}</p>
      {error && <p className="error">{error}</p>}
      <div className="followers-list">
        {filteredFollowers.length === 0 && <p>Você ainda não tem seguidores.</p>}
        {filteredFollowers.map((follower) => (
          <div key={follower.did} className="follower-item">
            <img
              src={follower.avatar}
              alt={follower.displayName}
              className="avatar"
            />
            <div className="follower-info">
              <p className="display-name">{follower.displayName}</p>
              <p className="handle">@{follower.handle}</p>
              {follower.description && (
                <p className="description">{follower.description}</p>
              )}
            </div>
            {/* Mostrar botão de seguir ou deixar de seguir conforme o estado */}
            {isFollowing(follower.did) ? (
              <button 
                className="unfollow-button" 
                onClick={() => handleUnfollow(follower.did)}
              >
                Unfollow
              </button>
            ) : (
              <button 
                className="follow-button" 
                onClick={() => handleFollow(follower.did)}
              >
                Follow
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Followers;
