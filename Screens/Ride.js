import React, { Component } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, KeyboardAvoidingView, TextInput } from 'react-native';

import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import firebase from "firebase";
import db from "../database";

export default class RideTab extends Component {
constructor(props) {
    super(props);
    this.state = {
      carId: "",
      userId: "",
      domState: "normal",
      hasCameraPermissions: null,
      scanned: false,
      carType: "",
      userName: "",
    };
  }

  returnCar = async (carId, userId, carType, userName) => {
    //add a transaction
    db.collection("transactions").add({
      user_id: userId,
      user_name: userName,
      car_id: carId,
      car_type: carType,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "return"
    });
    //change car status
    db.collection("Cars")
      .doc(carId)
      .update({
        is_car_available: true
      });
    //change value  of car assigned for user
    db.collection("Users")
      .doc(userId)
      .update({
        car_assigned: false
      });

    // Updating local state
    this.setState({
      carId: ""
    });
  };

  assignCar = async (carId, userId, carType, userName) => {
    //add a transaction
    db.collection("transactions").add({
      user_id: userId,
      user_name: userName,
      car_id: carId,
      car_type: carType,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type: "rented"
    });

    db.collection("Cars")
      .doc(carId)
      .update({
        is_car_available: false
      });

    db.collection("Users")
      .doc(userId)
      .update({
        car_assigned: true
      });

      this.setState({
      carId: ""
    });
  };

checkCarAvailability = async carId => {
    const carRef = await db
      .collection("Cars")
      .where("id", "==", carId)
      .where("email_id", "==", email)
      .get();

  var transactionType = "";
    if (carRef.docs.length == 0) {
      transactionType = false;
    } else {
      carRef.docs.map(doc => {
        if (!doc.data().is_car_available) {
          //if the car is available then transaction type will be rented
          // otherwise it will be return
          Alert.alert("The car is available")
          transactionType = doc.data().is_car_available ? "rented" : "return";
        } else {

        }
      });
    }

    return transactionType;
  };

handleTransaction = async () => {
    var { carId, userId } = this.state;
    await this.getCarDetails(carId);
    await this.getUserDetails(userId);

    var transactionType = await this.checkCarAvailability(carId);

    if (!transactionType) {
      this.setState({ carId: "" });
      Alert.alert("Kindly enter/scan valid car id");
    } else if (transactionType === "under_maintenance") {
      this.setState({
        carId: ""
      });
    } else if (transactionType === "rented") {
      var isEligible = await this.checkUserEligibilityForStartRide(userId);

      if (isEligible) {
        var { carType, userName } = this.state;
        this.assignCar(carId, userId, carType, userName);
        Alert.alert(
          "You have rented the car for next 1 hour. Enjoy your ride!!!"
        );
        this.setState({
          carAssigned: true
        });

      }
    } else {
      var isEligible = await this.checkUserEligibilityForEndRide(
        carId,
        userId
      );

      if (isEligible) {
        var { carType, userName } = this.state;
        this.returnCar(carId, userId, carType, userName);
        Alert.alert("We hope you enjoyed your ride");
        this.setState({
          carAssigned: false
        });
      }
    }
  };

  checkUserEligibilityForEndRide = async (carId, userId) => {
    const transactionRef = await db
      .collection("transactions")
      .where("car_id", "==", carId)
      .limit(1)
      .get();
    var isUserEligible = "";
    transactionRef.docs.map(doc => {
      var lastCarTransaction = doc.data();
      if (lastCarTransaction.user_id === userId) {
        isUserEligible = true;
      } else {
        isUserEligible = false;
        Alert.alert("This car is rented by another user");
        this.setState({
          carId: "",
        });
      }
    });
    return isUserEligible;
  };

  checkUserEligibilityForStartRide = async userId => {
    const userRef = await db
      .collection("Users")
      .where("user_id", "==", userId)
      .get();

    var isUserEligible = false;
    if (userRef.docs.length == 0) {
      this.setState({
        carId: ""
      });
      isUserEligible = false;
      Alert.alert("Invalid user id");
    } else {
      userRef.docs.map(doc => {
        if (!doc.data().car_assigned) {
          isUserEligible = true;
        } else {
          isUserEligible = false;
          Alert.alert("End the current ride to rent another car.");
          this.setState({
            carId: ""
          });
        }
      });
    } 

    return isUserEligible;
  };

    getCarDetails = carId => {
    carId = carId.trim();
    db.collection("Cars")
      .where("car_id", "==", carId)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            carType: doc.data().car_type
          });
        });
      });
  };

  getUserDetails = userId => {
    db.collection("Users")
      .where("user_id", "==", userId)
      .get()
      .then(snapshot => {
        snapshot.docs.map(doc => {
          this.setState({
            userName: doc.data().user_name,
            userId: doc.data().user_id,
            carAssigned: doc.data().car_assigned
          });
        });
      });
  };

  getCameraPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      hasCameraPermissions: status === "granted",
      domState: "scanner",
      scanned: false
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    this.setState({
      userId: data,
      domState: "normal",
      scanned: true
    });
  };

render() { const { carId, userId, domState, scanned, carAssigned } = this.state;
    if (domState !== "normal") {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
  return (
  <KeyboardAvoidingView behavior="padding" style={styles.container}>
  <View style={styles.upperContainer}>
          <Image source={require("../assets/car.jpg")} style={styles.appIcon} />
          <Text style={styles.title}>E-ride</Text>
        </View>
      <View style = {styles.upperContainer}>
          </View>
<View style={styles.lowerContainer}>
           <View style = {[styles.textinputContainer, {marginBottom: 20}]}>          
           <TextInput
              style={styles.textinput}
              onChangeText={text => this.setState({ carId: text })}
              placeholder={"Car Id"}
              placeholderTextColor={"#FFFFFF"}     
              value={carId}    
            />          
           </View>
           <View style = {styles.textinputContainer}>
           
            <TextInput
              style={styles.textinput}
              onChangeText={text => this.setState({ userId: text })}
              placeholder={"User Id"}
              placeholderTextColor={"#FFFFFF"}
              value={userId}
            />
            <TouchableOpacity
            style={styles.scanbutton} onPress={() => this.getCameraPermissions()}>
              <Text style={styles.scanbuttonText}>Scan</Text>
            </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => this.handleTransaction()}>
            <Text style={styles.buttonText}>{carAssigned ? "End Ride" : "Unlock"}</Text>
            </TouchableOpacity>
</View>
    </KeyboardAvoidingView>
    ) 
  }
}

const styles = StyleSheet.create ({
  button: {
    width: 150,
    height: 60,
    backgroundColor: "#e8fa98",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    borderRadius: 10,
    borderColor: "#a39371",
    borderWidth: 5
  },
  buttonText: {
    color: "black",
    fontFamily: "Rajdhani_500Medium",
    fontSize: 23
  },
  appIcon: {
    width: 280,
    height: 240,
    resizeMode: "contain",
    marginTop: 50,
  },
  textinput: {
    width: "57%",
    height: 50,
    padding: 10,
    borderColor: "#a39371",
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 18,
    backgroundColor: "#a39371",//#e8fa98 lightgreen
    fontFamily: "Rajdhani_500Medium"
  },
  title: {
    color: 'black',
    fontFamily: "Nunito_400",
    fontWeight: "bold",
    fontSize: 30,
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  lowerContainer: {
    top: -90,
    flex: 0.5,
    alignItems: "center"
  },
  textinputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#a39371",
    borderColor: "#a39371",
    height: 55
  },
  container: {
    flex: 1,
    backgroundColor: "#f5ee9d"//#f5ee9d
  },
  scanbutton: {
    width:100,
    height: 50,
    backgroundColor: '#e8fa98',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  scanbuttonText: {
    fontSize: 24,
    color: "#4C5D70",
    fontFamily: "Rajdhani_500Medium",
  }
})