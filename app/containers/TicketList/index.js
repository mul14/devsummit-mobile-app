import React, { Component } from 'react';
import {
  Container,
  Content,
  List,
  ListItem,
  Button,
  Text
} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../../components/Header';
import styles from './styles';

class TicketList extends Component {
  printDummy = () => {
    let rows = [];
    for (let i = 0; i < 20; i++) {
      rows.push(
        <ListItem key={i} style={styles.item}>
          <Text style={styles.text}>Gold</Text>
          <Button small style={styles.button}>
            <Text style={styles.buttonText}>Transfer</Text>
          </Button>
        </ListItem>
      );
    }
    return rows;
  }

  render() {
    return (
      <Container>
        <Header title="Ticket List" />
        <Content>
          <List>
            <ListItem style={styles.item}>
              <Text style={styles.text}>Gold</Text>
              <Button small style={styles.button}>
                <Text style={styles.buttonText}>Transfer</Text>
              </Button>
            </ListItem>
            { this.printDummy() }
          </List>
        </Content>
      </Container>
    );
  }
}

export default TicketList;