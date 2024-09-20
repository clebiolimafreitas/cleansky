import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Followers.css";

const Followers = () => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllFollowers = useCallback(async (cursor = null, allFollowers = []) => {
    try {
      const username = localStorage.getItem("username");
      const userHandle = `${username}.bsky.social`;

      // Faz a requisição para buscar os seguidores com o cursor
      const response = await axios.get(`https://public.api.bsky.app/xrpc/app.bsky.graph.getFollowers`, {
        params: {
          actor: userHandle,
          cursor, // Inclui o cursor se houver
        },
      });

      if (response.status === 200) {
        const newFollowers = response.data.followers || [];
        const updatedFollowers = [...allFollowers, ...newFollowers];

        // Se houver um novo cursor, faz a próxima requisição, senão retorna os seguidores acumulados
        if (response.data.cursor) {
          return fetchAllFollowers(response.data.cursor, updatedFollowers);
        } else {
          return updatedFollowers;
        }
      } else {
        throw new Error("Erro ao buscar os seguidores.");
      }
    } catch (error) {
      console.error("Erro ao buscar seguidores:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const loadFollowers = async () => {
      setLoading(true);
      setError("");

      try {
        const allFollowers = await fetchAllFollowers();
        setFollowers(allFollowers);
      } catch (error) {
        setError("Erro ao carregar os seguidores.");
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    };

    // Carrega todos os seguidores ao montar o componente
    loadFollowers();
  }, [fetchAllFollowers]);

  return (
    <div className="followers-container">
      <h2>Seguidores</h2>
      {!loading && <p className="follows-count">Total: {followers.length}</p>}       
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando...</p>
        </div>
      )}      
      {error && <p className="error">{error}</p>}      
      <div className="followers-list">
        {followers.length === 0 && !loading && <p>Você ainda não tem seguidores.</p>}
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
