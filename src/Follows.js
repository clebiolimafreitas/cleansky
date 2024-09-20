// src/Follows.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Follows.css";

const Follows = () => {
  const [follows, setFollows] = useState([]);
  const [loading, setLoading] = useState(true); // Inicializa o loading como true
  const [error, setError] = useState("");

  const fetchAllFollows = async (actor, cursor = null, allFollows = []) => {
    try {
      const response = await axios.get(
        `https://public.api.bsky.app/xrpc/app.bsky.graph.getFollows`,
        {
          params: {
            actor,
            cursor,
          },
        }
      );
      const newFollows = response.data.follows || [];
      const updatedFollows = [...allFollows, ...newFollows];
      if (response.data.cursor) {
        return fetchAllFollows(actor, response.data.cursor, updatedFollows);
      } else {
        return updatedFollows;
      }
    } catch (error) {
      console.error("Erro ao buscar follows:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchFollows = async () => {
      setLoading(true);
      setError("");

      try {
        const username = localStorage.getItem("username");
        const userHandle = `${username}.bsky.social`;

        const allFollows = await fetchAllFollows(userHandle);
        setFollows(allFollows);
      } catch (error) {
        console.error("Erro ao carregar follows:", error);
        setError("Erro ao carregar follows.");
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    };

    fetchFollows();
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
    <div className="follows-container">
      <h2>Seguindo</h2>
      <p className="follows-count">Total: {follows.length}</p>
      {follows.length > 0 ? (
        <ul className="follows-list">
          {follows.map(follow => (
            <li key={follow.did} className="follow-item">
              <img src={follow.avatar} alt={follow.displayName} className="follow-avatar" />
              <div>
                <p className="follow-name">{follow.displayName}</p>
                <p className="follow-handle">@{follow.handle}</p>
              </div>
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