// src/FollowersNotFollowedBack.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FollowersNotFollowedBack.css";

const FollowersNotFollowedBack = () => {
  const [follows, setFollows] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followersNotFollowedBack, setFollowersNotFollowedBack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllFollows = async (actor, cursor = null, allFollows = []) => {
    try {
      const response = await axios.get(
        `https://public.api.bsky.app/xrpc/app.bsky.graph.getFollows`,
        {
          params: { actor, cursor },
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
          params: { actor, cursor },
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

        const notFollowedBack = allFollowers.filter(follower =>
          !allFollows.some(follow => follow.did === follower.did)
        );
        setFollowersNotFollowedBack(notFollowedBack);

      } catch (error) {
        console.error("Erro ao carregar perfis que te seguem, mas você não segue:", error);
        setError("Erro ao carregar a lista.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowsAndFollowers();
  }, []);

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
