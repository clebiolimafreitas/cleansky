// src/NonFollowers.js
import React, { useEffect, useState } from "react";
import "./NonFollowers.css";
import { useUser } from './UserContext';
import { BskyAgent } from '@atproto/api';

const NonFollowers = () => {
  const { follows, setFollows } = useUser();  
  const { followers } = useUser();  
  const [nonFollowers, setNonFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agent, setAgent] = useState(null); // Estado para armazenar a instância do agent

  useEffect(() => {
    const initAgent = async () => {
      const newAgent = new BskyAgent({ service: 'https://bsky.social' });
      await newAgent.login({
        identifier: localStorage.getItem('username') + '.bsky.social',
        password: localStorage.getItem('password'),
      });
      setAgent(newAgent);
    };

    initAgent();
  }, []);

  useEffect(() => {
    const fetchFollowsAndFollowers = () => {
      const nonFollowBack = follows.filter(follow =>
        !followers.some(follower => follower.did === follow.did)
      );
      setNonFollowers(nonFollowBack);
      setLoading(false);
    };

    fetchFollowsAndFollowers();
  }, [follows, followers]);

  const handleUnfollow = async (did) => {
    if (!agent) {
      console.error('Agent not initialized.');
      return;
    }

    try {
      const { uri } = await agent.follow(did); // Buscando uri
      await agent.deleteFollow(uri); // Chama a função de unfollow da API
      console.log('Unfollow bem-sucedido:', did);

      // Atualizar a lista de follows
      setFollows(prev => prev.filter(follow => follow.did !== did));

      // Atualizar a lista de nonFollowers
      setNonFollowers(prev => prev.filter(friend => friend.did !== did));
    } catch (error) {
      console.error('Erro ao desfazer o follow:', error);
      setError("Erro ao desfazer o follow.");
    }
  };

  const handleUnfollowAll = async () => {
    for (const friend of nonFollowers) {
      await handleUnfollow(friend.did);      
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
    <div className="non-followers-container">
      <h2>N&atilde;o Rec&iacute;procos</h2>
      <p className="non-followers-count">Total: {nonFollowers.length}</p>
      <button 
        className="unfollow-all-button" 
        onClick={handleUnfollowAll}
        disabled={nonFollowers.length === 0} // Desabilita se não houver perfis
      >
        Unfollow Todos
      </button>
      {nonFollowers.length > 0 ? (
        <ul className="non-followers-list">
          {nonFollowers.map(friend => (
            <li key={friend.did} className="friend-item">
              <img src={friend.avatar} alt={friend.displayName} className="friend-avatar" />
              <div>
                <p className="friend-name">{friend.displayName}</p>
                <p className="friend-handle">@{friend.handle}</p>
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
        <p>Todos os perfis que você segue também te seguem.</p>
      )}
    </div>
  );
};

export default NonFollowers;
