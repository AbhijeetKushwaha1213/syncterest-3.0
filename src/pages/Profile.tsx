
import React from 'react';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Profile {id}</h1>
      <p>Profile page content goes here</p>
    </div>
  );
};

export default Profile;
