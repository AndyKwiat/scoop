import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";
import React, { useRef,useState } from "react";
import { Animated, View, StyleSheet, PanResponder, Text,Image ,Easing, Dimensions} from "react-native";
let pics =["https://homepages.cae.wisc.edu/~ece533/images/airplane.png",
"https://static-ssl.businessinsider.com/image/5d9b5bff52887931e8497a36-1405/141222twnmustang.jpg",
"https://d33wubrfki0l68.cloudfront.net/200d166fc3dff29e5b8a6703d8e83cc25821bcf4/10dd6/media/2018/08/kitten.jpg",
"https://guelphpolitico.files.wordpress.com/2020/02/misersky_dogpark-e1582571255961.jpg?w=940",
"https://geo0.ggpht.com/maps/photothumb/fd/v1?bpb=ChEKD3NlYXJjaC5nd3MtcHJvZBIgChIJg41l1rWaK4gRQ_nNQZ4p_78qCg0AAAAAFQAAAAAaBgjwARCYAw&gl=CA"]
const App = () => {
  const [frontIdea, setFrontIdea] = useState(0);
  const [nextIdea, setNextIdea] = useState(1);
  const mypos = useRef(new Animated.ValueXY()).current;
  const [opacity,setOpacity] = useState(1);
 
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
    //   console.log(gesture);
       mypos.setValue({ x: gesture.dx*.8 , y: 0 });
     
    },
    onPanResponderRelease:(event,gesture)=>{
      console.log("RELEASE")
      console.log( gesture.vx )
   
    //  mypos.setValue({x:offset.x, y:offset.y  })
   
      
        console.log("DONE1!")
        
        if (  Math.abs(gesture.vx) > 0.15 || Math.abs(gesture.dx) >  Dimensions.get('window').width*.5 ){
         
          let target = Dimensions.get('window').width;
          if (mypos.x._value < 0 ) {
            target *= -1;
          }
          Animated.timing( mypos,{
              toValue:{x: target, y:0},
              duration:100,
              useNativeDriver:false,
              easing:Easing.linear
            }).start(()=>{

          mypos.setValue({x:0, y:0});
          setOpacity(0);
          setImmediate(()=>{
            setFrontIdea(nextIdea)
            setNextIdea((nextIdea+1) %pics.length)
            setOpacity(1);
          })})
        

        //  setFrontIdea(nextIdea)
        //  setNextIdea((nextIdea+1) %pics.length)},0)
         
         // mypos.setValue({x:0, y:0})
          console.log(`${frontIdea} is the front idea` + JSON.stringify(mypos))
          // Animated.timing( mypos,{
          //   toValue:{x: Dimensions.get('window').width, y:0},
          //   duration:1000,
          //   useNativeDriver:false,
          //   easing:Easing.linear
          // }).start(()=>{
          //   mypos.setValue({x:0, y:0})
          //   setFrontIdea(nextIdea)
          //   setNextIdea((nextIdea+1) %pics.length)
          //   console.log(`${frontIdea} is the front idea` + JSON.stringify(mypos))
           
        // })
        }else{
          Animated.timing(mypos,{
            toValue:{x:0, y:0},
            duration:125,
            useNativeDriver: false,
            easing: Easing.ease
          }).start()
        }     
    }});
 
 


  return (
    <View style={{backgroundColor:"black", height:"100%"}}>
    <View style={styles.container} >
     
      <Image style={[styles.boxBack]} source={{uri:pics[nextIdea]} } resizeMode="cover"/>
      <Animated.View
        style={[mypos.getLayout(),{width:"100%", height:"100%"}]}
        {...panResponder.panHandlers}
      >
       
        <Image style={[styles.box, {opacity:opacity}]} source={{uri:pics[frontIdea]} } resizeMode="cover"/>
    
      </Animated.View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  //  flex: 1,
    width:"100%",
    height:"90%",
    alignItems: "center",
    justifyContent: "center"
  },
  boxBack:{
    position:"absolute",
    height:"100%",
    width:"100%",
    borderRadius: 15
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
    borderRadius: 15,
   }
});

export default App;