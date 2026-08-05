import React from 'react';
import { Link } from 'react-router-dom';
import { IconArrow } from '../../Shared/Icons/Icons';

const Service = ({ service, index = 0 }) => {
  const { name, description, img } = service;
  return (
    <article className={`dp-service dp-reveal dp-d${(index % 3) + 1}`}>
      <div className="dp-service-ic">
        <img src={img} alt="" />
      </div>
      <h3>{name}</h3>
      <p>{description}</p>
      <Link to="/appointment" className="more">
        Book this <IconArrow size={15} />
      </Link>
    </article>
  );
};

export default Service;
