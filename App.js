import React from "react";
import { StyleSheet, StatusBar, Platform, View } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import AsyncStorage from "@react-native-community/async-storage";

import * as Qiscus from "qiscus";
import * as Firebase from "utils/firebase";
import LoginScreen from "screens/LoginScreen";
import ProfileScreen from "screens/ProfileScreen";
import RoomListScreen from "screens/RoomListScreen";
import ChatScreen from "screens/ChatScreen";
import UserListScreen from "screens/UserListScreen";
import CreateGroupScreen from "screens/CreateGroupScreen";
import RoomInfoScreen from "screens/RoomInfo";

const AppNavigator = createStackNavigator(
  {
    Login: LoginScreen,
    Profile: ProfileScreen,
    RoomList: RoomListScreen,
    Chat: ChatScreen,
    UserList: UserListScreen,
    CreateGroup: CreateGroupScreen,
    RoomInfo: RoomInfoScreen
  },
  { headerMode: "none", initialRouteName: "Login" }
);
const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  componentDidMount() {
    GLOBAL.Qiscus = Qiscus;
    GLOBAL.Firebase = Firebase;
    Qiscus.init();
    AsyncStorage.getItem("qiscus").then(
      res => {
        if (res == null) return;
        const data = JSON.parse(res);
        Qiscus.qiscus.setUserWithIdentityToken({ user: data });
      },
      error => {
        console.log("error getting login data", error);
      }
    );
    this.subscription = Firebase.initiate$()
      .map(() => Firebase.createChannel())
      .map(() => Firebase.requestPermission$())
      .flatten()
      .map(() => Firebase.onNotification$())
      .flatten()
      .map(notification => Firebase.createNotification(notification))
      .subscribe({
        next: notification => Firebase.displayNotification(notification),
        error: error => console.log("error initiate firebase", error)
      });
  }

  componentWillUnmount() {
    if (this.subscription != null) this.subscription.unsubscribe();
  }

  render() {
    return (
      <>
        {Platform.OS === "ios" && <View style={{ height: 20 }} />}
        <AppContainer
          style={styles.container}
          ref={ref => (this.navigation = ref && ref._navigation)}
        />
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight
  }
});
