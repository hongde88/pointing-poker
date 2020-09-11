import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PlayerList from '../PlayerList/PlayerList';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import styles from './RoomInfo.module.css';
import { showUserVotes } from '../../store/actions/user';
import { setRoomNextStory } from '../../store/actions/room';

const RoomSettings = () => {
  const dispatch = useDispatch();
  const isHost = useSelector((state) => state.user.user.isHost);
  const statusMessage = useSelector((state) => state.room.room.statusMessage);
  const nextStory = useSelector((state) => state.room.room.nextStory);
  const gameState = useSelector((state) => state.room.room.gameState);
  const [hideVotes, setHideVotes] = useState(false);

  useEffect(() => {
    if (nextStory) {
      // setHideVotes(!hideVotes);
      const showVotesBtn = document.getElementById('show-votes-btn');
      if (showVotesBtn) {
        showVotesBtn.innerText = 'Show Votes';
        if (hideVotes) setHideVotes(!hideVotes);
      }
    } else {
      if (gameState === 'show user votes') {
        const showVotesBtn = document.getElementById('show-votes-btn');
        if (showVotesBtn) {
          showVotesBtn.innerText = 'Hide Votes';
          setHideVotes(true);
        }
      }

      if (gameState === 'hide user votes') {
        const showVotesBtn = document.getElementById('show-votes-btn');
        if (showVotesBtn) {
          showVotesBtn.innerText = 'Show Votes';
          setHideVotes(false);
        }
      }
    }

    // if (showVotes) {
    //   // setHideVotes(!hideVotes);
    //   const showVotesBtn = document.getElementById('show-votes-btn');
    //   if (showVotesBtn) {
    //     showVotesBtn.innerText = 'Hide Votes';
    //     if (!hideVotes) setHideVotes(!hideVotes);
    //   }
    // }
  }, [gameState, nextStory, hideVotes]);

  const onNextStory = () => {
    dispatch(setRoomNextStory());
  };

  const onShowVotes = () => {
    dispatch(showUserVotes(!hideVotes));
    // const showVotesBtn = document.getElementById('show-votes-btn');
    // if (!hideVotes) {
    //   if (showVotesBtn) {
    //     showVotesBtn.innerText = 'Hide Votes';
    //   }
    // } else {
    //   if (showVotesBtn) {
    //     showVotesBtn.innerText = 'Show Votes';
    //   }
    // }
    setHideVotes(!hideVotes);
  };

  return (
    <>
      <div className={styles.statusMessage}>{statusMessage || 'Waiting for everyone to vote'}</div>
      <PlayerList />
      {isHost ? (
        <Row>
          <Col>
            <Button id='show-votes-btn' onClick={onShowVotes}>
              Show Votes
            </Button>
          </Col>
          <Col>
            <Button onClick={onNextStory}>Next Story</Button>
          </Col>
        </Row>
      ) : null}
    </>
  );
};

export default RoomSettings;
