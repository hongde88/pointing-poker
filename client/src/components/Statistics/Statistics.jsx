import React from 'react';
import Table from 'react-bootstrap/Table';
import { useSelector } from 'react-redux';

const Statistics = () => {
  const users = useSelector((state) => state.room.room.users);

  const getAverage = () => {
    let average = NaN;

    if (Array.isArray(users) && users.length > 0) {
      let sumVotes = 0;
      let numVotes = 0;

      for (let i = 0; i < users.length; i++) {
        const vote = users[i].vote;
        if (vote === '½') {
          sumVotes += 0.5;
          numVotes++;
        } else if (typeof vote === 'string' && vote !== '?') {
          sumVotes += parseInt(vote) || 0;
          numVotes++;
        }
      }

      average = (sumVotes / numVotes).toFixed(1);
    }

    return average;
  };

  const getStats = () => {
    const stats = [];

    if (Array.isArray(users) && users.length > 0) {
      const map = new Map();

      for (let i = 0; i < users.length; i++) {
        const vote = users[i].vote;
        if (vote) {
          if (map.has(vote)) {
            map.set(vote, map.get(vote) + 1);
          } else {
            map.set(vote, 1);
          }
        } else {
          if (map.has('blank')) {
            map.set('blank', map.get('blank') + 1);
          } else {
            map.set('blank', 1);
          }
        }
      }

      map.forEach((value, key) => {
        let pointValue = null;

        switch (key) {
          case 'blank':
            pointValue = 101;
            break;
          case '?':
            pointValue = 102;
            break;
          case '½':
            pointValue = 0.5;
            break;
          default:
            pointValue = parseInt(key);
            break;
        }

        stats.push({
          point: key,
          votes: value,
          pointValue,
        });
      });

      stats.sort((a, b) => a.pointValue - b.pointValue);
    }

    return stats;
  };

  return (
    <div>
      <Table responsive borderless striped>
        <thead>
          <tr>
            <th colSpan='2'>Statistics</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Average</td>
            <td>{getAverage()}</td>
          </tr>
          <tr>
            <td>Point</td>
            <td>Votes</td>
          </tr>
          {getStats().map((stat, idx) => {
            return (
              <tr key={idx}>
                <td>{stat.point}</td>
                <td>{stat.votes}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default Statistics;
