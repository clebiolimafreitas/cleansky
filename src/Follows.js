// src/Follows.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Follows.css";
import { useUser } from './UserContext';
import { BskyAgent } from '@atproto/api';

const Follows = () => {
  const { follows, setFollows } = useUser();
  const [filteredFollows, setFilteredFollows] = useState(follows);
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
        setLoading(false); // Definir loading como false após inicializar o agente
      } catch (error) {
        setError("Erro ao inicializar o agente.");
        setLoading(false); // Definir loading como false em caso de erro
      }
    };

    initAgent();
  }, []);

  // Atualiza os follows filtrados quando o texto de busca ou a lista de follows muda
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredFollows(follows); // Se o campo de busca estiver vazio, mostra todos os follows
    } else {
      const filtered = follows.filter(follow =>
        follow.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
        follow.handle.toLowerCase().includes(searchText.toLowerCase()) ||
        (follow.description && follow.description.toLowerCase().includes(searchText.toLowerCase())) // Filtro também por descrição
      );
      setFilteredFollows(filtered);
    }
  }, [searchText, follows]);

  // Função para desfazer o follow de um perfil individualmente
  const handleUnfollow = async (did) => {
    if (!agent) {
      console.error('Agent não inicializado.');
      return;
    }

    try {
      const { uri } = await agent.follow(did); // Buscar uri para follow
      await agent.deleteFollow(uri); // Chama a função de unfollow da API
      console.log('Unfollow bem-sucedido:', did);

      // Atualizar a lista de follows e filteredFollows
      setFollows(prev => prev.filter(follow => follow.did !== did));
    } catch (error) {
      console.error('Erro ao desfazer o follow:', error);
      setError("Erro ao desfazer o follow.");
    }
  };

  // Função para desfazer follow de todos os perfis
  const handleUnfollowAll = async () => {
    for (const follow of filteredFollows) {
      await handleUnfollow(follow.did);
    }
  };

  // Verifica se o agente ou os follows ainda estão carregando
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  // Exibe erros, se houver
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="follows-container">
      <h2>Seguindo</h2>
      
      {/* Campo de busca */}
      <input
        type="text"
        placeholder="Filtrar por nome, handle ou descri&ccedil;&atilde;o..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="search-input"
      />

      <p className="follows-count">Total: {filteredFollows.length}</p>

      {/* Botão de Unfollow Todos */}
      <button 
        className="unfollow-all-button" 
        onClick={handleUnfollowAll}
        disabled={filteredFollows.length === 0} // Desabilita se não houver perfis
      >
        Unfollow Todos
      </button>

      {filteredFollows.length > 0 ? (
        <ul className="follows-list">
          {filteredFollows.map(follow => (
            <li key={follow.did} className="follow-item">
              <img src={follow.avatar} alt={follow.displayName} className="follow-avatar" />
              <div className="follow-info">
                <p className="follow-name">{follow.displayName}</p>
                <p className="follow-handle">@{follow.handle}</p>
                {/* Exibindo a descrição se houver */}
                {follow.description && <p className="follow-description">{follow.description}</p>}
              </div>
              <button 
                className="unfollow-button" 
                onClick={() => handleUnfollow(follow.did)}
              >
                Unfollow
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum follow encontrado.</p>
      )}
    </div>
  );
};

export default Follows;
