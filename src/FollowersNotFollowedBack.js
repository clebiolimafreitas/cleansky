// src/FollowersNotFollowedBack.js
import React, { useEffect, useState } from "react";
import "./FollowersNotFollowedBack.css";
import { useUser } from './UserContext';
import { BskyAgent } from '@atproto/api';

const FollowersNotFollowedBack = () => {
  const { follows, setFollows } = useUser(); // Assumindo que setFollows está disponível no contexto
  const { followers } = useUser();
  const [followersNotFollowedBack, setFollowersNotFollowedBack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [following, setFollowing] = useState({}); // Para rastrear perfis sendo seguidos
  
  useEffect(() => {
    const fetchFollowsAndFollowers = () => {
      const notFollowedBack = followers.filter(follower =>
        !follows.some(follow => follow.did === follower.did)
      );
      setFollowersNotFollowedBack(notFollowedBack);
      setLoading(false); // Definindo loading como false após carregar a lista
    };

    fetchFollowsAndFollowers();
  }, [follows, followers]);

  const handleFollow = async (did) => {
    setFollowing(prev => ({ ...prev, [did]: true })); // Marcar como seguindo

    const agent = new BskyAgent({
      service: 'https://bsky.social',  // URL do serviço
    });

    // Autenticar usando credenciais do localStorage
    await agent.login({
      identifier: localStorage.getItem('username')+'.bsky.social',  // Nome de usuário
      password: localStorage.getItem('password'),    // Senha
    });

    try {
      const response = await agent.follow(did);
      console.log('Follow bem-sucedido:', response);
      
      // Atualizar a lista de followersNotFollowedBack
      setFollowersNotFollowedBack(prev => 
        prev.filter(follower => follower.did !== did) // Remove o seguido da lista
      );

      // Atualizar a lista de follows
      setFollows(prev => [...prev, { did }]); // Adiciona o novo seguido

    } catch (error) {
      console.error('Erro ao seguir o perfil:', error);
      setError("Erro ao seguir o perfil."); // Define uma mensagem de erro
    } finally {
      setFollowing(prev => ({ ...prev, [did]: false })); // Marcar como não seguindo
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="followers-not-followed-back-container">
      <h2>N&atilde;o seguidos</h2>
      <p className="followers-not-followed-back-count">Total: {followersNotFollowedBack.length}</p>
      {followersNotFollowedBack.length > 0 ? (
        <ul className="followers-not-followed-back-list">
          {followersNotFollowedBack.map(follower => (
            <li key={follower.did} className="follower-item">
              <img src={follower.avatar} alt={follower.displayName} className="follower-avatar" />
              <div>
                <p className="follower-name">{follower.displayName}</p>
                <p className="follower-handle">@{follower.handle}</p>
              </div>
              <button
                className="follow-button"
                onClick={() => handleFollow(follower.did)}
                disabled={following[follower.did]} // Desabilita o botão se o usuário já estiver sendo seguido
              >
                {following[follower.did] ? "Seguindo..." : "Seguir"}
              </button>
            </li>
          ))} 
        </ul>
      ) : (
        <p>Nenhum seguidor que você não segue de volta foi encontrado.</p>
      )}
    </div>
  );
};

export default FollowersNotFollowedBack;
