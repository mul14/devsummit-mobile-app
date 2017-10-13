import React, { Component } from 'react';
import {
  Container,
  Content,
  Picker,
  Item,
  Button,
  Text
} from 'native-base';
import { View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';

// import redux components
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import styles from './styles';
import strings from '../../localization';
import * as actions from './actions';
import * as selectors from './selectors';
import { PAYMENT_METHODS, BANK_TRANSFERS, CREDIT_CARD_LIST } from './constants';
import PayPal from 'react-native-paypal';


let bankList = [];


class Payment extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    this.props.navigation.setParams({
      handleIconTouch:
      this.handleIconTouch
    });
  }

  handleInputChange = (field, value) => {
    this.props.updateInputFields(field, value);
    if (field === 'paymentType' && value !== 'credit_card' && value !== 'bank_transfer') {
      const selectedMethod = PAYMENT_METHODS.filter((data) => {
        return data.payment_type === value;
      });
      this.props.updateErrorFields('bankDestination', selectedMethod[0].bankDestination);
    }
    this.props.updateErrorFields(`error_${field}`, value = !(value.length > 0));
  }
  payWithPaypal() {
    PayPal.paymentRequest({
      clientId: 'Ac-Ikn76GlVB5tFLwMoFYEl9FGumrB7NYdkicE5bd7Q_QfWmnKDyK_ZlZ7mFB-MlENIQR1fTvcj1Ivdv',
      environment: 'Sandbox',
      price: '40',
      currency: 'USD',
      description: 'Paypal Test'
    }).then(response => console.log(response))
    .catch(error => console.log(error))
  }

  render() {
    const { inputFields, order } = this.props;
    const {
      paymentType,
      bankDestination
    } = inputFields || '';

    if (paymentType === 'bank_transfer') {
      bankList = BANK_TRANSFERS;
    } else if (paymentType === 'credit_card') {
      bankList = CREDIT_CARD_LIST;
    }
    return (
      <Container style={styles.container}>
        <Content>
          <Text style={styles.littleText}>{strings.payment.method}</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              style={styles.picker}
              mode="dropdown"
              selectedValue={paymentType}
              onValueChange={value => this.handleInputChange('paymentType', value)}
            >
              {PAYMENT_METHODS.map(component => (
                <Item key={component.value} label={component.label} value={component.payment_type} />
              ))}
            </Picker>
          </View>
          {(paymentType === 'bank_transfer' || paymentType === 'credit_card') ?
            <View>
              <Text style={styles.littleText}>{strings.payment.bank}</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  style={styles.picker}
                  placeholder="Bank"
                  mode="dropdown"
                  selectedValue={bankDestination}
                  onValueChange={value => this.handleInputChange('bankDestination', value)}
                >
                  {bankList.map(component => (
                    <Item
                      key={component.value}
                      label={component.label}
                      value={component.bankDestination}
                    />
                  ))}
                </Picker>
              </View>
            </View> : <View />}
          <Button
            style={styles.button}
            onPress={() => {
              Actions.paymentDetail({ order });
            }}
          >
            <Text>
              {strings.payment.goToPaymentDetail}
            </Text>
          </Button>
          <Button
            style={styles.button}
            onPress={() => {
              this.payWithPaypal();
            }}
          >
            <Text>
              Pay using Paypal
            </Text>
          </Button>
        </Content>
      </Container>
    );
  }
}

// props validation
Payment.propTypes = {
  updateErrorFields: PropTypes.func.isRequired,
  updateInputFields: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  inputFields: PropTypes.object.isRequired,
  order: PropTypes.object.isRequired
};

/**
 *  Map redux state to component props
 */
const mapStateToProps = createStructuredSelector({
  inputFields: selectors.getInputFields(),
  errorFields: selectors.getErrorFields()
});

export default connect(mapStateToProps, actions)(Payment);
