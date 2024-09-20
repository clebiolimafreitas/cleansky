// src/MutualFriends.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MutualFriends.css";

const MutualFriends = () => {
  const [follows, setFollows] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [mutualFriends, setMutualFriends] = useState([]);
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

        const mutual = allFollows.filter(follow =>
          allFollowers.some(follower => follower.did === follow.did)
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
