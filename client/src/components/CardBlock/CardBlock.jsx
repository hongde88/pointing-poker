import React from 'react';
import PropType from 'prop-types';
import styles from './CardBlock.module.css';

const cards = ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?'];

const Card = ({ content, onClick }) => {
  return (
    <button className='card-btn' onClick={() => onClick(content)}>
      <div className={styles.leftIcon}>{content}</div>
      <div className={styles.centerIcon}>{content}</div>
      <div className={styles.rightIcon}>{content}</div>
    </button>
  );
};

Card.propTypes = {
  content: PropType.string.isRequired,
  onClick: PropType.func.isRequired,
};

const CardBlock = ({ onClick }) => {
  return (
    <div>
      <ul>
        {cards.map((card, idx) => (
          <Card key={idx} content={card} onClick={onClick} />
        ))}
      </ul>
    </div>
  );
};

CardBlock.propTypes = {
  onClick: PropType.func.isRequired,
};

export default CardBlock;
