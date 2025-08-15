
import React from 'react';
import { useParams } from 'react-router-dom';

const MessageDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Message Detail {id}</h1>
      <p>Message detail page content goes here</p>
    </div>
  );
};

export default MessageDetail;
