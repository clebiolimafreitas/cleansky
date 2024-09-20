// src/Profile.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [followsCount, setFollowsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(false);
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
    const fetchProfileAndCounts = async () => {
      setLoading(true);
      setError("");

      try {
        const username = localStorage.getItem("username");
        const userHandle = `${username}.bsky.social`;

        // Fetching profile data
        const response = await axios.get(
          `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile`,
          {
            params: { actor: userHandle },
          }
        );

        if (response.status === 200) {
          setProfile(response.data);
        } else {
          setError("Erro ao carregar o perfil.");
        }

        // Fetching all follows
        const allFollows = await fetchAllFollows(userHandle);
        setFollowsCount(allFollows.length);

        // Fetching all followers
        const allFollowers = await fetchAllFollowers(userHandle);
        setFollowersCount(allFollowers.length);

      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
        setError("Erro ao carregar o perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndCounts();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div>Carregando...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="profile-container">
      {profile && (
        <div className="profile-card">
          <img src={profile.avatar} alt={profile.displayName} className="avatar" />
          <h2>{profile.displayName}</h2>
          <p className="handle">@{profile.handle}</p>
          {profile.description && (
            <div className="description">
              {profile.description.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}
          <div className="counts-container">
            <p className="follows-count">{followsCount} Seguindo</p>
            <p className="followers-count">{followersCount} Seguidores</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
