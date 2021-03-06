import React, { Component } from 'react';
import {
  Container,
  Content,
  Tabs,
  Tab,
  TabHeading,
  Fab,
  Card,
  CardItem,
  Body,
  Left,
  Right,
  Item,
  Thumbnail,
  Input,
  Spinner,
  Picker
} from 'native-base';
import {
  View,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  AsyncStorage,
  Modal,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  ScrollView,
  TouchableHighlight,
  WebView,
  Platform
} from 'react-native';
import { func, bool, object, array, string } from 'prop-types';
import ImagePicker from 'react-native-image-crop-picker';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import openSocket from 'socket.io-client';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Entypo';
import CameraIcon from 'react-native-vector-icons/FontAwesome';
import IconSimpleLine from 'react-native-vector-icons/SimpleLineIcons';
import CloseO from 'react-native-vector-icons/EvilIcons';
import Share, { ShareSheet, Button } from 'react-native-share';
import Toast from 'react-native-simple-toast';
import 'moment/locale/pt-br';
import styles from './styles';
import strings from '../../localization';
import HeaderPoint from '../../components/Header';
import * as actions from './actions';
import * as selectors from './selectors';
import OrderList from '../OrderList';
import Redeem from '../Redeem';
import { PRIMARYCOLOR } from '../../constants';
import { API_BASE_URL } from '../../constants';
import { CONTENT_REPORT, TWITTER_ICON, FACEBOOK_ICON, WHATSAPP_ICON } from './constants';
import { isConfirm } from '../../helpers';
import { getIsConfirmEmail } from '../OrderList/selectors';

const socket = openSocket(API_BASE_URL);
const noFeeds = require('./../../../assets/images/nofeed.png');

function subscribeToFeeds(cb) {
  socket.on('feeds', data => cb(null, data));
}

const today = new Date();
const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
const dateTime = `${date} ${time}`;

function timeDifference(current, previous) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return 'few seconds ago';
  } else if (elapsed < msPerHour) {
    return `${Math.round(elapsed / msPerMinute)} minutes ago`;
  } else if (elapsed < msPerDay) {
    return `${Math.round(elapsed / msPerHour)} hours ago`;
  } else if (elapsed < msPerMonth) {
    if (previous.getMonth() + 1 === 1) {
      return `${previous.getDate()} Jan`;
    } else if (previous.getMonth() + 1 === 2) {
      return `${previous.getDate()} Feb`;
    } else if (previous.getMonth() + 1 === 3) {
      return `${previous.getDate()} Mar`;
    } else if (previous.getMonth() + 1 === 4) {
      return `${previous.getDate()} Apr`;
    } else if (previous.getMonth() + 1 === 5) {
      return `${previous.getDate()} May`;
    } else if (previous.getMonth() + 1 === 6) {
      return `${previous.getDate()} Jun`;
    } else if (previous.getMonth() + 1 === 7) {
      return `${previous.getDate()} Jul`;
    } else if (previous.getMonth() + 1 === 8) {
      return `${previous.getDate()} Aug`;
    } else if (previous.getMonth() + 1 === 9) {
      return `${previous.getDate()} Sep`;
    } else if (previous.getMonth() + 1 === 10) {
      return `${previous.getDate()} Oct`;
    } else if (previous.getMonth() + 1 === 11) {
      return `${previous.getDate()} Nov`;
    } else if (previous.getMonth() + 1 === 12) {
      return `${previous.getDate()} Dec`;
    }
  }
}

/* eslint-disable */
String.prototype.toDateFromDatetime = function() {
  var parts = this.split(/[- :]/);
  return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
};
/* eslint-enable */

/**
 * Map redux state to component props
 */
const mapStateToProps = () =>
  createStructuredSelector({
    isFetching: selectors.getIsFetchingFeeds(),
    isFetchingMore: selectors.getIsFetchingMore(),
    feeds: selectors.getFetchFeeds(),
    links: selectors.getFeedsLinks(),
    isPosting: selectors.getIsPostingFeed(),
    imagesData: selectors.getUpdateImage(),
    textData: selectors.getUpdateText(),
    currentPage: selectors.getCurrentPage(),
    isRemoving: selectors.getIsRemoveFeed(),
    isConfirmEmail: getIsConfirmEmail()
  });

class Feed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      userPostID: '',
      postId: '',
      firstName: '',
      lastName: '',
      profileUrl: 'https://museum.wales/media/40374/thumb_480/empty-profile-grey.jpg',
      fabActive: false,
      modalRedeem: false,
      modalVisible: false,
      postToFeeds: false,
      imagePreview: '',
      visible: false,
      modalReport: false,
      optionVisible: false,
      report: '',
      shareOptions: {
        message: '',
        url: null
      },
      shareTwitter: {
        message: '',
        url: null
      },
      modalWebView: false,
      link: ''
    };
    console.ignoredYellowBox = [ 'Setting a timer' ];
    subscribeToFeeds((err, data) => this.props.updateFeeds(data));
  }

  componentWillMount() {
    this.props.setTokenHeader(this.props.currentPage);

    AsyncStorage.getItem('profile_data').then((profile) => {
      const data = JSON.parse(profile);
      const firstName = data.first_name;
      const lastName = data.last_name;
      const url = data.photos[0].url;
      const id = data.id;
      this.setState({ firstName, lastName, profileUrl: url, userId: id });
    });
  }

  componentWillUnmount() {
    this.props.updateCurrentPage(1);
  }

  onCancel = () => {
    this.setState({ visible: false });
  };

  setModalVisible = (visible, image) => {
    this.setState({ modalVisible: visible, imagePreview: image });
  };

  setModalRedeem = (visible) => {
    this.setState({ modalRedeem: visible });
  };

  setModalPost = (visible) => {
    this.setState({ postToFeeds: visible });
    this.props.clearImage();
    this.props.clearTextField();
  };

  setModalReport = (visible) => {
    this.setState({ modalReport: visible });
  };

  setModalWebView = (visible, link) => {
    this.setState({ modalWebView: visible });
    this.state.link = link;
  };

  postFeed = (callback) => {
    this.props.postFeeds(this.props.imagesData, this.props.textData);
    this.setModalPost(false);
  };

  uploadImage = () => {
    ImagePicker.openPicker({
      width: 400,
      height: 300,
      cropping: true,
      includeBase64: true
    })
      .then((image) => {
        this.props.updateImage(image);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  takeImage = () => {
    ImagePicker.openCamera({
      width: 400,
      height: 300,
      includeBase64: true
    })
      .then((image) => {
        this.props.updateImage(image);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleChange = (value) => {
    this.props.updateText(value);
  };

  fetchNextFeeds = () => {
    this.props.fetchPageWithPaginate(this.props.currentPage);
  };

  _keyExtractor = (item, index) => item.id;

  onOpen = (_message, _url) => {
    this.setState({ visible: true });

    let urlTwitter = '';
    const share = Object.assign({}, this.state.shareOptions);
    const shareTwitter = Object.assign({}, this.state.shareTwitter);

    if (_url === null) {
      urlTwitter = '';
    } else {
      urlTwitter = _url;
    }

    shareTwitter.message = _message;
    shareTwitter.url = urlTwitter;
    share.message = _message;
    share.url = _url;
    this.setState({ shareOptions: share, shareTwitter });
  };

  alertRemoveFeed = (postId) => {
    Alert.alert(
      '',
      'Are you sure you want to delete this post?',
      [
        { text: 'CANCEL', onPress: () => this.setState({ optionVisible: false }) },
        { text: 'DELETE', onPress: () => this.removeFeed(postId) }
      ],
      { cancelable: false }
    );
  };

  removeFeed = (postId) => {
    this.props.removeFeed(postId);
    this.setState({ optionVisible: false });
  };

  alertReportFeed = (postId) => {
    Alert.alert(
      '',
      'Are you sure you want to report this post?',
      [
        { text: 'CANCEL', onPress: () => this.setState({ optionVisible: false }) },
        { text: 'REPORT', onPress: () => this.reportFeed(postId) }
      ],
      { cancelable: false }
    );
  };

  reportFeed = (postId) => {
    this.props.reportFeed(postId);
    this.setState({ optionVisible: false });
  };

  handleInputChange = (value) => {
    this.setState({ report: value });
  };

  render() {
    return (
      <Container style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#FF8B00',
            justifyContent: 'space-between'
          }}
        >
          <HeaderPoint title={strings.feed.title} />
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end'
            }}
          >
            <TouchableWithoutFeedback onPress={() => Actions.notification()}>
              <View style={styles.viewNotification}>
                <CameraIcon
                  name="bell"
                  style={styles.notificationIcon}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
        <Tabs style={styles.tabs} initialPage={this.props.activePage || 0}>
          <Tab
            heading={
              <TabHeading style={styles.tabHeading}>
                <Text style={styles.tabTitle}>{strings.feed.newsFeed}</Text>
              </TabHeading>
            }
          >
            <Content style={{ backgroundColor: '#E0E0E0' }}>
              {this.props.isFetching ? (
                <Spinner color="#FF8B00" />
              ) : (
                this.props.feeds && (
                  <View style={{ flex: 1 }}>
                    {!this.props.feeds.length > 0 ? (
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          margin: 100
                        }}
                      >
                        <Image source={noFeeds} style={{ opacity: 0.5 }} />
                        <Text style={styles.artworkText}>Your feeds is empty</Text>
                      </View>
                    ) : (
                      <FlatList
                        keyExtractor={this._keyExtractor}
                        data={this.props.feeds}
                        initialNumToRender={5}
                        renderItem={({ item }) =>
                          (item.type === 'sponsor' ? (
                            <Card style={{ flex: 0 }}>
                              <CardItem>
                                <Left>
                                  <Thumbnail source={{ uri: item.user.attachment || '' }} />
                                  <Body>
                                    <Text>{item.user.name}</Text>
                                    <Text note>
                                      <IconSimpleLine name="globe" /> sponsored
                                    </Text>
                                  </Body>
                                </Left>
                              </CardItem>
                              <CardItem>
                                <Body>
                                  <Text style={{ marginBottom: 8 }}>{item.message}</Text>
                                  <TouchableOpacity
                                    style={{ alignSelf: 'center' }}
                                    onPress={() => this.setModalWebView(true, item.redirect_url)}
                                  >
                                    {item.attachment && (
                                      <Image
                                        source={{ uri: item.attachment }}
                                        style={styles.images}
                                      />
                                    )}
                                  </TouchableOpacity>
                                </Body>
                              </CardItem>
                              <CardItem>
                                <Right>
                                  <Button
                                    transparent
                                    textStyle={{ color: '#87838B' }}
                                    onPress={() => this.onOpen(item.message, item.attachment)}
                                  >
                                    <Icon name="share" style={{ fontSize: 16, color: '#0000ff' }} />
                                    <Text style={styles.buttonShare}>{strings.feed.share}</Text>
                                  </Button>
                                </Right>
                              </CardItem>
                            </Card>
                          ) : (
                            <Card style={{ flex: 1, paddingRight: 20 }}>
                              <View style={{ padding: 12, flexDirection: 'row' }}>
                                <Thumbnail source={{ uri: item.user.photos[0].url || '' }} />
                                <View>
                                  <View style={{ marginLeft: 8 }}>
                                    <Text style={{ color: '#000' }}>
                                      {item.user.first_name} {item.user.last_name}
                                    </Text>
                                    <Text note>
                                      {timeDifference(today, item.created_at.toDateFromDatetime())}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      flex: 1,
                                      flexDirection: 'row',
                                      flexWrap: 'wrap',
                                      marginRight: 20
                                    }}
                                  >
                                    <Text style={{ color: '#000', margin: 10 }}>
                                      {item.message}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                              <View style={{ flex: 1 }}>
                                <TouchableOpacity
                                  style={styles.touchImage}
                                  onPress={() => this.setModalVisible(true, item.attachment)}
                                >
                                  {item.attachment && (
                                    <Image
                                      source={{ uri: item.attachment }}
                                      resizeMode="contain"
                                      style={styles.images}
                                    />
                                  )}
                                </TouchableOpacity>
                                <View
                                  style={{
                                    borderBottomColor: '#BDBDBD',
                                    borderWidth: 0.5,
                                    marginRight: -20
                                  }}
                                />
                                <View
                                  style={{
                                    flex: 1,
                                    flexDirection: 'row'
                                  }}
                                >
                                  {this.state.userId === item.user_id ? (
                                    <TouchableWithoutFeedback
                                      onPress={() => this.alertRemoveFeed(item.id)}
                                    >
                                      <View
                                        style={{
                                          flex: 1,
                                          backgroundColor: 'transparent',
                                          borderRadius: 8
                                        }}
                                      >
                                        <Text style={styles.buttonReport}>
                                          {strings.feed.delete}
                                        </Text>
                                      </View>
                                    </TouchableWithoutFeedback>
                                  ) : (
                                    <TouchableWithoutFeedback
                                      onPress={() => this.alertReportFeed(item.id)}
                                    >
                                      <View
                                        style={{
                                          flex: 1,
                                          backgroundColor: 'transparent',
                                          borderRadius: 8
                                        }}
                                      >
                                        <Text style={styles.buttonReport}>
                                          {strings.feed.report}
                                        </Text>
                                      </View>
                                    </TouchableWithoutFeedback>
                                  )}
                                  <TouchableWithoutFeedback
                                    onPress={() => this.onOpen(item.message, item.attachment)}
                                  >
                                    <View
                                      style={{
                                        flex: 1,
                                        marginLeft: 10,
                                        backgroundColor: 'transparent',
                                        borderRadius: 8
                                      }}
                                    >
                                      <Text style={styles.buttonReport}>{strings.feed.share}</Text>
                                    </View>
                                  </TouchableWithoutFeedback>
                                </View>
                              </View>
                            </Card>
                          ))}
                      />
                    )}
                    {this.props.links.next && this.props.feeds.length > 0 ? (
                      this.props.isFetchingMore ? (
                        <Spinner color="#FF8B00" />
                      ) : (
                        <Card>
                          <CardItem>
                            <Body
                              style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'space-around'
                              }}
                            >
                              <TouchableOpacity onPress={this.fetchNextFeeds}>
                                <Text style={{ color: '#42A5F5' }}>{strings.feed.showMore}</Text>
                              </TouchableOpacity>
                            </Body>
                          </CardItem>
                        </Card>
                      )
                    ) : (
                      <View />
                    )}
                  </View>
                )
              )}
            </Content>
            <Fab
              style={{ backgroundColor: '#FF8B00' }}
              position="bottomRight"
              onPress={() => this.setModalPost(true)}
            >
              <CameraIcon name="pencil-square-o" />
            </Fab>
          </Tab>
          <Tab
            heading={
              <TabHeading style={styles.tabHeading}>
                <Text style={styles.tabTitle}>{strings.feed.ticket}</Text>
              </TabHeading>
            }
          >
            <OrderList />
            {!this.props.isConfirmEmail ? (
              <View />
            ) : (
              <ActionButton buttonColor={'#FF8B00'} spacing={7} offsetY={20} offsetX={20} fixNativeFeedbackRadius size={55}>
                <ActionButton.Item title="New Order" style={{ backgroundColor: '#FF8B00', height: 40, width: 40 }} onPress={() => Actions.newOrder()}>
                  <CameraIcon
                    name="ticket"
                    color="#FFFFFF"
                    style={{ textAlign: 'center', fontSize: 30 }}
                  />
                </ActionButton.Item>
                <ActionButton.Item title="Ticket List" style={{ backgroundColor: '#FF8B00' }} onPress={() => Actions.ticketList()}>
                  <CameraIcon
                    name="list"
                    color="#FFFFFF"
                    style={{ textAlign: 'center', fontSize: 23 }}
                  />
                </ActionButton.Item>
                <ActionButton.Item title="Redeem Code" style={{ backgroundColor: '#FF8B00' }} onPress={() => this.setModalRedeem(true)}>
                  <CameraIcon
                    name="gift"
                    color="#FFFFFF"
                    style={{ textAlign: 'center', fontSize: 30 }}
                  />
                </ActionButton.Item>
              </ActionButton>
            )}
          </Tab>
        </Tabs>
        {/* Redeem Modal */}
        <Modal
          animationType="fade"
          visible={this.state.modalRedeem}
          onRequestClose={() => this.setModalRedeem(!this.state.modalRedeem)}
          transparent
        >
          <View style={{ flex: 1, justifyContent: 'center' }} backgroundColor="rgba(0, 0, 0, 0.5)">
            <View style={styles.redeem}>
              <TouchableWithoutFeedback
                onPress={() => this.setModalRedeem(!this.state.modalRedeem)}
              >
                <CameraIcon style={styles.iconClose} name="times" />
              </TouchableWithoutFeedback>
              <View style={styles.viewredeem}>
                <CameraIcon name="gift" style={{ fontSize: 40, color: PRIMARYCOLOR, margin: 10 }} />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: PRIMARYCOLOR }}>
                  {strings.redeem.redeem}
                </Text>
              </View>
              <Redeem />
            </View>
          </View>
        </Modal>
        {/* Modal WebView */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalWebView}
          onRequestClose={() => {
            this.setModalWebView(!this.state.modalWebView, null);
          }}
        >
          <View style={{ flex: 1 }}>
            <WebView
              ref={'webview'}
              automaticallyAdjustContentInsets={false}
              source={{ uri: this.state.link }}
              javaScriptEnabled
              domStorageEnabled
              decelerationRate="normal"
              startInLoadingState
              scalesPageToFit={this.state.scalesPageToFit}
            />
          </View>
        </Modal>
        {/* Modal for create new feeds post */}
        <Modal
          animationType={'fade'}
          transparent
          visible={this.state.postToFeeds}
          onRequestClose={() => this.setModalPost(!this.state.postToFeeds)}
        >
          <Card>
            <KeyboardAvoidingView>
              <ScrollView
                keyboardShouldPersistTaps="always"
                ref={ref => (this.scrollView = ref)}
                onContentSizeChange={(height, width) =>
                  this.scrollView.scrollToEnd({ animated: true })}
              >
                <CardItem>
                  <Left>
                    <Thumbnail source={{ uri: this.state.profileUrl }} />
                    <Body>
                      <Text>
                        {this.state.firstName} {this.state.lastName}
                      </Text>
                    </Body>
                  </Left>
                  <TouchableOpacity onPress={() => this.setModalPost(false)}>
                    <Right>
                      <CameraIcon name="times-circle-o" size={30} />
                    </Right>
                  </TouchableOpacity>
                </CardItem>

                <CardItem>
                  <Item regular>
                    <CustomInput
                      textData={this.props.textData}
                      onChangeText={text => this.handleChange(text)}
                    />
                  </Item>
                </CardItem>

                <CardItem>
                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <TouchableHighlight onPress={() => this.uploadImage(this)}>
                      <View style={{ margin: 10 }}>
                        <CameraIcon name="image" size={24} color="grey" />
                      </View>
                    </TouchableHighlight>
                    <TouchableOpacity onPress={() => this.takeImage(this)}>
                      <View style={{ margin: 10 }}>
                        <CameraIcon name="camera" size={24} color="grey" />
                      </View>
                    </TouchableOpacity>
                    {this.props.textData !== '' ||
                    (this.props.imagesData.path || this.props.imagesData.sourceURL) ? (
                      <TouchableOpacity onPress={() => this.postFeed()}>
                          <View
                          style={{
                              borderWidth: 1,
                              borderColor: 'blue',
                              borderRadius: 20,
                              width: 75,
                              height: 45,
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                        >
                          <Text style={{ textAlign: 'center', margin: 10, color: 'blue' }}>
                            Post
                            </Text>
                        </View>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity activeOpacity={1}>
                          <View
                            style={{
                              borderWidth: 1,
                              borderColor: 'grey',
                              borderRadius: 20,
                              width: 75,
                              height: 45,
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Text style={{ textAlign: 'center', margin: 10, color: 'grey' }}>
                            Post
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                  </View>
                </CardItem>
                {this.props.imagesData &&
                  (this.props.imagesData.path || this.props.imagesData.sourceURL) && (
                    <CardItem cardBody>
                      <Image
                        source={{
                          uri: this.props.imagesData.path || this.props.imagesData.sourceURL
                        }}
                        style={{ height: 200, width: null, flex: 1 }}
                      />
                    </CardItem>
                  )}
              </ScrollView>
            </KeyboardAvoidingView>
          </Card>
        </Modal>
        {/* Modal for picture preview */}
        <Modal
          animationType={'fade'}
          transparent
          visible={this.state.modalVisible}
          onRequestClose={() => this.setModalVisible(!this.state.modalVisible)}
        >
          <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#080808' }}>
            <View style={{ flex: 1, flexDirection: 'column', margin: 10 }}>
              <Image
                source={{ uri: this.state.imagePreview }}
                resizeMode={'contain'}
                style={{ flex: 1 }}
              />
              {Platform === 'ios' ? (
                <CloseO
                  size={30}
                  onPress={() => this.setModalVisible(!this.state.modalVisible)}
                  name="close-o"
                  style={{
                    flex: 0,
                    flexDirection: 'column',
                    backgroundColor: '#b8d8d8',
                    alignItems: 'center'
                  }}
                />
              ) : null}
            </View>
          </View>
        </Modal>

        {/* Modal For Reports  */}
        <Modal
          animationType="slide"
          transparent
          visible={this.state.modalReport}
          onRequestClose={() => this.setModalReport(false)}
        >
          <View>
            <View style={styles.modalText}>
              <Text>All reports are confidential</Text>
              <Text style={{ fontSize: 12 }}>What best describe this content?</Text>
            </View>
            <Picker
              mode="dropdown"
              placeholder="Chosee your report here"
              selectedValue={this.state.report}
              onValueChange={value => this.handleInputChange(value)}
            >
              {CONTENT_REPORT.map(item => (
                <Item key={item.value} label={item.label} value={item.report} />
              ))}
            </Picker>
          </View>
        </Modal>
        {/* Sheet For Share */}
        <ShareSheet visible={this.state.visible} onCancel={this.onCancel.bind(this)}>
          <Button
            iconSrc={{ uri: TWITTER_ICON }}
            onPress={() => {
              this.onCancel();
              setTimeout(() => {
                Share.shareSingle(Object.assign(this.state.shareTwitter, { social: 'twitter' }));
              }, 300);
            }}
          >
            {strings.global.twitter}
          </Button>
          <Button
            iconSrc={{ uri: FACEBOOK_ICON }}
            onPress={() => {
              this.onCancel();
              setTimeout(() => {
                Share.shareSingle(Object.assign(this.state.shareOptions, { social: 'facebook' }));
              }, 300);
            }}
          >
            {strings.global.facebook}
          </Button>
          <Button
            iconSrc={{ uri: WHATSAPP_ICON }}
            onPress={() => {
              this.onCancel();
              setTimeout(() => {
                Share.shareSingle(Object.assign(this.state.shareOptions, { social: 'whatsapp' }));
              }, 300);
            }}
          >
            {strings.global.whatsapp}
          </Button>
        </ShareSheet>
      </Container>
    );
  }
}

/* eslint-disable */
class CustomInput extends Component {
  componentDidMount() {
    this._input._root.focus();
  }

  render() {
    return (
      <Input
        rounded
        placeholder={strings.feed.shareActivity}
        style={{ textAlignVertical: 'top' }}
        multiline
        ref={input => (this._input = input)}
        numberOfLines={8}
        value={this.props.textData}
        onChangeText={text => this.props.onChangeText(text)}
      />
    );
  }
}

Feed.PropTypes = {
  updateFeeds: func,
  fetchFeeds: func,
  updateText: func,
  postFeeds: func,
  isFetching: bool,
  isFetchingMore: bool,
  imagesData: object,
  feeds: array,
  textData: string,
  isRemoving: bool,
  removeFeed: func,
  reportFeed: func,
  link: string
};

export default connect(mapStateToProps, actions)(Feed);
