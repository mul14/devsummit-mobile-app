import { combineReducers } from 'redux-immutable';

// reducers import
import MainReducer from './containers/Main/reducer';
import RegisterMenuReducer from './containers/RegisterMenu/reducer';
import RegisterPhoneReducer from './containers/RegisterPhone/reducer';
import RegisterEmailReducer from './containers/RegisterEmail/reducer';
import TicketListReducer from './containers/TicketList/reducer';
import NewOrderReducer from './containers/NewOrder/reducer';
import AttendeesListReducer from './containers/AttendeesList/reducer';
import changePasswordReducer from './containers/ChangePassword/reducer';
import ProfileReducer from './containers/Profile/reducer';
import paymentMethodReducer from './containers/Payment/reducer';
import paymentDetailReducer from './containers/PaymentDetail/reducer';
import OrderListReducer from './containers/OrderList/reducer';
import OrderDetailReducer from './containers/OrderDetail/reducer';
import SpeakerListReducer from './containers/Speaker/reducer';
import ScheduleListReducer from './containers/Schedule/reducer';
import MaterialListReducer from './containers/MaterialList/reducer';
import BoothListReducer from './containers/BoothList/reducer';
import BoothInfoReducer from './containers/BoothInfo/reducer';
import codeRedeemReducer from './containers/Redeem/reducer';
import Notification from './containers/Notification/reducer';
import FeedReducer from './containers/Feed/reducer';
import SettingsReducer from './containers/Settings/reducer';

const rootReducers = combineReducers({
  main: MainReducer,
  registerMenu: RegisterMenuReducer,
  registerEmail: RegisterEmailReducer,
  registerPhone: RegisterPhoneReducer,
  ticketList: TicketListReducer,
  attendeesList: AttendeesListReducer,
  changePassword: changePasswordReducer,
  profile: ProfileReducer,
  newOrder: NewOrderReducer,
  methodPayment: paymentMethodReducer,
  detailPayment: paymentDetailReducer,
  orderList: OrderListReducer,
  orderDetail: OrderDetailReducer,
  settings: SettingsReducer,
  speakerList: SpeakerListReducer,
  scheduleList: ScheduleListReducer,
  materialList: MaterialListReducer,
  boothList: BoothListReducer,
  boothInfo: BoothInfoReducer,
  code: codeRedeemReducer,
  notificationList: Notification,
  feed: FeedReducer
});

export default rootReducers;
