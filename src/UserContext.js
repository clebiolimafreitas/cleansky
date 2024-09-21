import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [follows, setFollows] = useState([]);
  const [followers, setFollowers] = useState([]);

  return (
    <UserContext.Provider value={{ follows, setFollows, followers, setFollowers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);