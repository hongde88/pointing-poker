import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useSelector } from 'react-redux';
import Avatar from '../Avatar/Avatar';
import styles from './PlayerList.module.css';

const PlayerList = () => {
  const players = useSelector((state) => state.room.room.users);
  const userName = useSelector((state) => state.user.user.name);
  const host = useSelector((state) => state.room.room.host);
  const showVotes = useSelector((state) => state.room.room.showVotes);

  return (
    <div className={styles.playersDiv}>
      {players.map((player, idx) => {
        return (
          <Row key={`${player}_${idx}`} className={styles.playerDiv}>
            <Col>
              <Avatar
                key={idx}
                index={player.index}
                small={true}
                name={player.name}
                host={player.name === host}
                you={player.name === userName}
              />
            </Col>

            {showVotes ? (
              <Col>
                <span style={{ fontWeight: 'bold', fontSize: '20px' }}>{player.vote || ''}</span>
              </Col>
            ) : player.voted ? (
              <Col>
                <CheckCircleIcon />
              </Col>
            ) : (
              ''
            )}
          </Row>
        );
      })}
    </div>
  );
};

export default PlayerList;
