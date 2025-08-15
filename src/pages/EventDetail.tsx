
import React from 'react';
import { useParams } from 'react-router-dom';

const EventDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">Event Detail {id}</h1>
      <p>Event detail page content goes here</p>
    </div>
  );
};

export default EventDetail;
