// src/Follows.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Follows.css";
import { useUser } from './UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as fullStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as emptyStar } from '@fortawesome/free-regular-svg-icons';

const Follows = () => {
  const { follows } = useUser();
  const [followsWithStar, setFollowsWithStar] = useState([]);
  const [error, setError] = useState("");

  // Função para carregar o arquivo JSON com os follows com estrela
  const loadFollowsWithStar = async () => {
    try {
      const response = await axios.get("/followscomestrela.json");
      setFollowsWithStar(response.data || []);
    } catch (error) {
      setError("Erro ao carregar os follows com estrela.");
    }
  };

  // Função para salvar a lista atualizada de follows com estrela
  const saveFollowsWithStar = async (updatedFollowsWithStar) => {
    try {
      await axios.post("/save-followscomestrela", updatedFollowsWithStar); // Supondo que tenha uma API para salvar o arquivo
      setFollowsWithStar(updatedFollowsWithStar);
    } catch (error) {
      setError("Erro ao salvar os follows com estrela.");
    }
  };

  // Função para marcar ou desmarcar um follow como estrela
  const toggleStar = (follow) => {
    const isStarred = followsWithStar.some(f => f.handle === follow.handle);
    let updatedFollowsWithStar;

    if (isStarred) {
      // Se já tem estrela, remover
      updatedFollowsWithStar = followsWithStar.filter(f => f.handle !== follow.handle);
    } else {
      // Se não tem estrela, adicionar
      updatedFollowsWithStar = [...followsWithStar, follow];
    }

    // Salvar a lista atualizada
    saveFollowsWithStar(updatedFollowsWithStar);
  };

  useEffect(() => {
    loadFollowsWithStar();
  }, []);

  // if (error) {
  //   return <div className="error">{error}</div>;
  // }

  return (
    <div className="follows-container">
      <h2>Seguindo</h2>
      <p className="follows-count">Total: {follows.length}</p>
      {follows.length > 0 ? (
        <ul className="follows-list">
          {follows.map(follow => {
            const isStarred = followsWithStar.some(f => f.handle === follow.handle);
            return (
              <li key={follow.did} className="follow-item">
                <img src={follow.avatar} alt={follow.displayName} className="follow-avatar" />
                <div className="follow-info">
                  <p className="follow-name">{follow.displayName}</p>
                  <p className="follow-handle">@{follow.handle}</p>
                </div>
                <div className="follow-actions">
                  <button onClick={() => toggleStar(follow)} className="star-button">
                    <FontAwesomeIcon
                      icon={isStarred ? fullStar : emptyStar}
                      style={{ color: isStarred ? '#FFD700' : '#ccc' }}
                    />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Nenhum follow encontrado.</p>
      )}
    </div>
  );
};

export default Follows;
