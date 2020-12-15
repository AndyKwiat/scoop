import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";
import React, { useRef } from "react";
import { Animated, View, StyleSheet, PanResponder, Text,Image ,Easing} from "react-native";
let pics =["https://homepages.cae.wisc.edu/~ece533/images/airplane.png"]
const App = () => {
 /// const pan = useRef(new Animated.ValueXY()).current;

 let offset = {x:0,y:0}
 let nx = {x:0,y:0}
 const mypos = new Animated.ValueXY();
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
    //   console.log(gesture);
       mypos.setValue({ x: gesture.dx , y: 0 });
       nx.x = gesture.dx + offset.x;
       nx.y = gesture.dy + offset.y;
    },
    onPanResponderRelease:(event,gesture)=>{
      console.log("RELEASE")
      console.log( gesture.vx )
      offset= {x:nx.x, y:nx.y }
    //  mypos.setValue({x:offset.x, y:offset.y  })
      nx = {x:0, y:0}
      let decay = 0.99
      if ( Math.abs(gesture.vx) < 1 ){
        decay = 0
      }
      Animated.decay(mypos, {
        velocity: {x: gesture.vx, y: 0},
        deceleration: decay,
        useNativeDriver: false
      }).start(()=>{
        console.log("DONE1!")
        Animated.timing(mypos,{
          toValue:{x:0, y:0},
          duration:125,
          useNativeDriver: false,
          easing: Easing.ease
        }).start(()=>{
          nx = {x:0, y:0}
          offset = {x:0,y:0}})    }
      
      )
      
    }
   
 });
 


  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Drag this box!</Text>
      <Animated.View
        style={[mypos.getLayout(),{width:"90%", height:"90%", borderColor:"red", borderWidth:10}]}
        {...panResponder.panHandlers}
      >
       
        <Image style={[styles.box]} source={{uri:pics[0]} } resizeMode="cover"/>
    
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
    //  flex:1,
    height: "100%",
    width:"100%",
   // width: 150,
    backgroundColor: "blue",
    borderRadius: 5,
    borderColor:"green",
    borderWidth:5
  }
});

export default App;