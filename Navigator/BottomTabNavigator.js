import React, { Component } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import RideScreen from "../Screens/Ride";
import RentHistory from "../Screens/RentHistory";

const Tab = createBottomTabNavigator();

export default class BottomTabNavigator extends Component {
  render() {
    return (
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
//Fill the missing code below to add the route name
            if (route.name === "Ride") {
                iconName = "car";
              } else if (route.name === "Rent History") {
                iconName = "time";
              }  

              // You can return any component that you like here!
              return (
                <Ionicons
                  name={iconName}
                  size={size}
                  color={color}
                  size={size}
                />
              );
            }
          })}
          tabBarOptions={{
            //fill the code to add #FBE5C0 to activeTintColor and black for inactiveTintColor 
           activeTintColor: "lightblue",
           inactiveTintColor: "black",
            style: {
              height: 100,
              borderTopWidth: 0,
              backgroundColor: "#F88379",
            },
            labelStyle: {
              fontSize: 20,
              fontFamily: "Nunito_Regular400",
            },
            labelPosition: "below-icon",
            tabStyle: {
              alignItems: "center",
              justifyContent: "center",
            }
          }}
        >
          <Tab.Screen name="Ride" component={RideScreen} />
          <Tab.Screen name="Rent History" component={RentHistory} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}
