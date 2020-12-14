import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";
import React, { useRef } from "react";
import { Animated, View, StyleSheet, PanResponder, Text,Image } from "react-native";
let pics =["https://homepages.cae.wisc.edu/~ece533/images/airplane.png"]
const App = () => {
 /// const pan = useRef(new Animated.ValueXY()).current;

 let offset = {x:0,y:0}
 let nx = {x:0,y:0}
 const mypos = new Animated.ValueXY();
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
       console.log(gesture);
       mypos.setValue({ x: gesture.dx + offset.x, y: gesture.dy+offset.y });
       nx.x = gesture.dx + offset.x;
       nx.y = gesture.dy + offset.y;
    },
    onPanResponderRelease:(event,gesture)=>{
      offset= {x:nx.x, y:nx.y }
      mypos.setValue({x:offset.x, y:offset.y  })
      nx = {x:0, y:0}
      
    }
   
 });

 


  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Drag this box!</Text>
      <Animated.View
        style={[mypos.getLayout()]}
        {...panResponder.panHandlers}
      >
       
        <Image style={[styles.box]} source={{uri:pics[0]}}/>
    
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "bold"
  },
  box: {
    height: 500,
    width:500,
   // width: 150,
    backgroundColor: "blue",
    borderRadius: 5
  }
});

export default App;