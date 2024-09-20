// src/NonFollowers.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./NonFollowers.css";

const NonFollowers = () => {
  const [follows, setFollows] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [nonFollowers, setNonFollowers] = useState([]);
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

  const fetchAllFollowers = async (actor, cursor = null, allFollowers = []) => {
    try {
      const response = await axios.get(
        `https://public.api.bsky.app/xrpc/app.bsky.graph.getFollowers`,
        {
          params: {
            actor,
            cursor,
          },
        }
      );
      const newFollowers = response.data.followers || [];
      const updatedFollowers = [...allFollowers, ...newFollowers];
      if (response.data.cursor) {
        return fetchAllFollowers(actor, response.data.cursor, updatedFollowers);
      } else {
        return updatedFollowers;
      }
    } catch (error) {
      console.error("Erro ao buscar followers:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchFollowsAndFollowers = async () => {
      setLoading(true);
      setError("");

      try {
        const username = localStorage.getItem("username");
        const userHandle = `${username}.bsky.social`;

        const allFollows = await fetchAllFollows(userHandle);
        const allFollowers = await fetchAllFollowers(userHandle);

        setFollows(allFollows);
        setFollowers(allFollowers);

        const nonFollowBack = allFollows.filter(follow =>
          !allFollowers.some(follower => follower.did === follow.did)
        );
        setNonFollowers(nonFollowBack);
      } catch (error) {
        console.error("Erro ao carregar perfis que não seguem de volta:", error);
        setError("Erro ao carregar perfis que não seguem de volta.");
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
    <div className="non-followers-container">
      <h2>N&atilde;o Rec&iacute;procos</h2>
      <p className="non-followers-count">Total: {nonFollowers.length}</p>
      {nonFollowers.length > 0 ? (
        <ul className="non-followers-list">
          {nonFollowers.map(friend => (
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
        <p>Todos os perfis que você segue também te seguem.</p>
      )}
    </div>
  );
};

export default NonFollowers;
