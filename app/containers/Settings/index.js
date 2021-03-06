import React, { Component } from 'react';
import { Container, Content, Text, Spinner } from 'native-base';
import { View, ScrollView, Image, TouchableWithoutFeedback, Modal } from 'react-native';
import { Actions } from 'react-native-router-flux';
import CameraIcon from 'react-native-vector-icons/FontAwesome';
import VersionNumber from 'react-native-version-number';

// import redux componens
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { getProfileData } from '../../helpers';
import strings from '../../localization';
import Button from '../../components/Button';
import Header from '../../components/Header';
import styles from './styles';
import InputItem from '../../components/InputItem';

import * as actions from './actions';
import * as selectors from './selectors';

class Settings extends Component {
  constructor(props) {
    super(props);
    this.setModalVisible = this.setModalVisible.bind(this);
    this.state = {
      id: null,
      firstName: '',
      lastName: '',
      photo: null,
      version: VersionNumber.appVersion,
      versionCode: VersionNumber.buildVersion
    };
  }
  componentWillMount() {
    getProfileData().then((profileData) => {
      if (profileData) {
        this.handleInputChange('username', profileData.username);
        this.handleInputChange('firstName', profileData.first_name);
        this.handleInputChange('lastName', profileData.last_name);
        this.handleUpdateAvatar(profileData.photos[0].url);
        if (profileData.role_id === 3) {
          this.handleInputChange('boothInfo', profileData.booth.summary);
        }
        if (profileData.role_id === 4) {
          this.handleInputChange('job', profileData.speaker.job);
          this.handleInputChange('summary', profileData.speaker.summary);
        }
      }
    });
  }

  componentWillReceiveProps(prevProps) {
    if (prevProps.isLogOut !== this.props.isLogOut) {
      Actions.main();
      this.props.updateIsLogOut(false);
    }
  }

  setModalVisible(visible) {
    this.props.updateModalVisibility(visible);
  }

  handleInputChange = (field, value) => {
    this.props.updateFields(field, value);
  };

  handleChangeFeedback = (value) => {
    this.props.updateFeedback(value);
  };

  handleUpdateAvatar = (value) => {
    this.props.updateAvatar(value);
  };

  render() {
    const { fields, avatar, isLoading, feedBack, isLoadingFeedback, modalVisible } =
      this.props || {};
    const { firstName, lastName, username } = fields || '';
    console.log('VISIBILITYMODAL', isLoadingFeedback);
    return (
      <Container>
        <Content>
          <ScrollView>
            <Header title={strings.settings.title} />
            <Content>
              <View style={styles.section2}>
                <TouchableWithoutFeedback onPress={() => Actions.profile()}>
                  <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    <Image
                      source={{ uri: avatar }}
                      style={{ width: 70, height: 70, borderRadius: 35 }}
                    />
                    <View style={{ marginLeft: 8, justifyContent: 'center' }}>
                      <Text>
                        {firstName} {lastName}
                      </Text>
                      <Text style={{ color: '#BDBDBD' }}>{username}</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <View style={{ borderColor: '#BDBDBD', borderWidth: 0.5, marginBottom: 20 }} />
                <Button block style={styles.button} onPress={() => Actions.codeConduct()}>
                  <Text>{strings.settings.codeConduct}</Text>
                </Button>
                <Button block style={styles.button} onPress={() => Actions.privacyPolicy()}>
                  <Text>{strings.settings.privacyPolicy}</Text>
                </Button>
                <Button block style={styles.button} onPress={() => this.setModalVisible(true)}>
                  <Text>{strings.settings.feedback}</Text>
                </Button>
                <Button
                  block
                  style={[ styles.button, { backgroundColor: 'red' } ]}
                  onPress={() => {
                    this.props.logOut();
                  }}
                >
                  {isLoading ? <Spinner color="#FFFFFF" /> : <Text>{strings.settings.logout}</Text>}
                </Button>
                <Text note style={styles.version}>
                  v{this.state.version}({this.state.versionCode})
                </Text>
              </View>
            </Content>
          </ScrollView>
          {/* Modal Feedback */}
          <Modal
            animationType={'fade'}
            visible={modalVisible}
            onRequestClose={() => this.setModalVisible(!modalVisible)}
            transparent
          >
            <View style={styles.parentView}>
              <View style={styles.viewHeader}>
                <Text style={styles.textFeedback}>{strings.settings.feedback}</Text>
                <TouchableWithoutFeedback onPress={() => this.setModalVisible(!modalVisible)}>
                  <CameraIcon style={styles.iconClose} name="times" />
                </TouchableWithoutFeedback>
              </View>
              <View style={styles.viewInput}>
                <InputItem
                  itemStyle={styles.item}
                  style={styles.inputItem}
                  placeholder={strings.settings.yourFeedback}
                  placeholderTextColor={'#BDBDBD'}
                  onChangeText={(text) => {
                    this.handleChangeFeedback(text);
                  }}
                  value={feedBack}
                />
                <TouchableWithoutFeedback
                  onPress={() => {
                    this.props.addFeedback();
                  }}
                >
                  <View>
                    {isLoadingFeedback ? (
                      <Spinner color="#f39e21" style={{ paddingTop: 40 }} />
                    ) : (
                      <Text style={styles.textStyle}>{strings.settings.submit}</Text>
                    )}
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </Modal>
        </Content>
      </Container>
    );
  }
}

/**
 *  Map redux state to component props
 */
const mapStateToProps = createStructuredSelector({
  fields: selectors.getFields(),
  isProfileUpdated: selectors.getIsProfileUpdated(),
  avatar: selectors.getAvatar(),
  isAvatarUpdated: selectors.getIsAvatarUpdated(),
  isDisabled: selectors.getIsDisabled(),
  isLoading: selectors.getIsLoading(),
  isLogOut: selectors.getIsLogOut(),
  feedBack: selectors.getFeedback(),
  isFeedbackPosted: selectors.getIsFeedbackPosted(),
  isLoadingFeedback: selectors.getIsLoadingFeedback(),
  modalVisible: selectors.getModalVisible()
});

export default connect(mapStateToProps, actions)(Settings);
