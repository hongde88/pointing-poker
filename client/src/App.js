import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Room from './components/Room/Room';
import Logo from './components/Logo/Logo';
import Splash from './pages/Splash/Splash';
import configureStore from './store/configureStore';

const RoomWrapper = ({ match }) => {
  return (
    <>
      <div className='small-logo'>
        <Logo size='sm' />
      </div>
      <Row>
        <Col>
          <Container fluid className='room-container'>
            <Switch>
              <Route path={`${match.path}/:id`} exact component={Room} />
            </Switch>
          </Container>
        </Col>
      </Row>
    </>
  );
};

const App = () => {
  const store = configureStore();

  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path='/' exact>
            <Splash />
          </Route>
          <Route path='/rooms' component={RoomWrapper} />
        </Switch>
      </Router>
    </Provider>
  );
};

export default App;
