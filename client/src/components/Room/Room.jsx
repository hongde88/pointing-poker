import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import { setRoomNavigatedFrom, setRoomLoading, updateRoomStoryDescription } from '../../store/actions/room';
import { userLeaveRoom, setUserLoading, updateUserVote } from '../../store/actions/user';
import RoomInfo from '../RoomInfo/RoomInfo';
import styles from './Room.module.css';
import CardBlock from '../CardBlock/CardBlock';
import Statistics from '../Statistics/Statistics';

const Room = () => {
  // const history = useHistory();
  const { id } = useParams();
  const user = useSelector((state) => state.user.user.name);
  const userVote = useSelector((state) => state.user.user.vote);
  const isHost = useSelector((state) => state.user.user.isHost);
  const storyDescription = useSelector((state) => state.room.room.storyDescription);

  const gameState = useSelector((state) => state.room.room.gameState);

  const [copied, setCopied] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    window.onpopstate = (e) => {
      dispatch(userLeaveRoom());
      dispatch(setRoomLoading());
      dispatch(setUserLoading());
      if (id) {
        dispatch(setRoomNavigatedFrom(id));
      }
    };

    if (gameState === 'hide user votes') {
      const buttons = document.getElementsByClassName('card-btn');

      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].children[0].innerText === userVote) {
          buttons[i].children[0].style.color = 'white';
          buttons[i].children[1].style.color = 'white';
          buttons[i].children[2].style.color = 'white';
          buttons[i].style.backgroundColor = '#007bff';
          buttons[i].blur();
        } else {
          buttons[i].children[0].style.color = '#808284';
          buttons[i].children[1].style.color = '#131b23';
          buttons[i].children[2].style.color = '#808284';
          buttons[i].style.backgroundColor = 'white';
        }
      }
    }

    if (gameState === 'update user vote') {
      const buttons = document.getElementsByClassName('card-btn');

      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].children[0].innerText === userVote) {
          buttons[i].children[0].style.color = 'white';
          buttons[i].children[1].style.color = 'white';
          buttons[i].children[2].style.color = 'white';
          buttons[i].style.backgroundColor = '#007bff';
          buttons[i].blur();
        } else {
          buttons[i].children[0].style.color = '#808284';
          buttons[i].children[1].style.color = '#131b23';
          buttons[i].children[2].style.color = '#808284';
          buttons[i].style.backgroundColor = 'white';
        }
      }
    }
  });

  useEffect(() => {
    if (storyDescription) {
      const input = document.getElementById('storyDescription');
      if (input) input.value = storyDescription;
    }
  }, [storyDescription]);

  if (!user) {
    if (id) {
      dispatch(setRoomNavigatedFrom(id));
    }
    return (
      <Redirect
        to={{
          pathname: '/',
        }}
      />
    );
  }

  if (gameState === 'set room next story') {
    const buttons = document.getElementsByClassName('card-btn');

    for (let i = 0; i < buttons.length; i++) {
      buttons[i].children[0].style.color = '#808284';
      buttons[i].children[1].style.color = '#131b23';
      buttons[i].children[2].style.color = '#808284';
      buttons[i].style.backgroundColor = 'white';
    }

    const input = document.getElementById('storyDescription');
    if (input) input.value = null;
  }

  const onClick = (vote) => {
    dispatch(updateUserVote(vote));
  };

  const onChange = (e) => {
    if (e.target.value) {
      dispatch(updateRoomStoryDescription(e.target.value));
    }
  };

  return (
    <div className={styles.roomContainer}>
      <div>
        Description:{' '}
        {isHost ? (
          <input
            id='storyDescription'
            type='text'
            placeholder='Story description. Only the host could edit'
            size='100'
            onChange={onChange}
          />
        ) : (
          <input id='storyDescription' type='text' placeholder='Story description. Only the host could edit' size='100' disabled />
        )}
      </div>
      <Row>
        <Col md='8'>{gameState === 'show user votes' ? <Statistics /> : <CardBlock onClick={onClick} />}</Col>
        <Col md='4'>
          <RoomInfo />
        </Col>
      </Row>
      <div>
        <div className={styles.copyRoomId}>
          Invite a teammate: <span style={{ color: '#007bff', fontWeight: 'bold' }}>{window.location.href}</span>
          <CopyToClipboard
            text={window.location.href}
            onCopy={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <Button variant={copied ? 'success' : 'primary'}>{copied ? 'Copied' : 'Copy'}</Button>
          </CopyToClipboard>
        </div>
      </div>
    </div>
  );
};

export default Room;
