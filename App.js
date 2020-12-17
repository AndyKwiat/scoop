import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";
import React, { useRef,useState } from "react";
import { Animated, View, StyleSheet, PanResponder, Text,Image ,Easing, Dimensions, TouchableHighlight} from "react-native";
let pics =["https://homepages.cae.wisc.edu/~ece533/images/airplane.png",
"https://static-ssl.businessinsider.com/image/5d9b5bff52887931e8497a36-1405/141222twnmustang.jpg",
"https://d33wubrfki0l68.cloudfront.net/200d166fc3dff29e5b8a6703d8e83cc25821bcf4/10dd6/media/2018/08/kitten.jpg",
"https://guelphpolitico.files.wordpress.com/2020/02/misersky_dogpark-e1582571255961.jpg?w=940",
"https://geo0.ggpht.com/maps/photothumb/fd/v1?bpb=ChEKD3NlYXJjaC5nd3MtcHJvZBIgChIJg41l1rWaK4gRQ_nNQZ4p_78qCg0AAAAAFQAAAAAaBgjwARCYAw&gl=CA",
"https://www.stirfrygames.com/img/ATtYBwIEv71DK4B8CVkwyNTTSnNqsjbMla4Gq3L98wa968u4iUVfEtJ6yGOj5XFwliHLel123dVwB3rr6CH9GWHXukYP0TVlfuuIOsNAQRK5mFtkznGt1QGYaMYv3-bz8ENicrBs6VgUXxCNV__5okHI3ZpILpxegRdtHQBtfVFo-2LOtgEG.jpg"]

const ideasRaw = require('./ideas.parks.json');
const App = () => {
  const ideas = ideasRaw.results;
  const [frontIdea, setFrontIdea] = useState(0);
  const [nextIdea, setNextIdea] = useState(1);
  const mypos = useRef(new Animated.ValueXY()).current;
  const detailsModeAnim = useRef(new Animated.Value(0)).current 
  const [opacity,setOpacity] = useState(1);
  const [touchTime, setTouchTime] = useState(0);
  const [isDetailsMode,setIsDetailsMode] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (ev, gestureState) => {  
      setTouchTime((new Date()).getTime()) 
  
      return true },
    onPanResponderMove: (event, gesture) => {
   
     if ( isDetailsMode ){
       return
     }
       mypos.setValue({ x: gesture.dx*.8 , y: 0 });
   // }
     
    },
    onPanResponderRelease:(event,gesture)=>{
      if (  (new Date()).getTime() - touchTime < 150 && gesture.vx < .1 && gesture.vy < .1 && Math.abs(gesture.dx) < 10 && Math.abs(gesture.dy) < 10 ){
     
        onTapPic(detailsModeAnim, isDetailsMode, setIsDetailsMode)
        return
      }
      if ( isDetailsMode ) return
     
        
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
            setNextIdea((nextIdea+1) %ideas.length)
            setOpacity(1);
          })})
        

       
      //    console.log(`${frontIdea} is the front idea` + JSON.stringify(mypos))
         
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
     
      <Image style={[styles.boxBack]} source={{uri:getPicUri(ideas[nextIdea])} } resizeMode="cover"/>
     
      <Animated.View
         style={[mypos.getLayout(),{
          width:"100%", 
        height:detailsModeAnim.interpolate({inputRange:[0,1], outputRange:["100%","50%"]}),
        transform: [{
          translateY: detailsModeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0,0]  // 0 : 150, 0.5 : 75, 1 : 0
          })}]      
      }]}
        {...panResponder.panHandlers}
      >
       
        <Image style={[styles.box, {opacity:opacity}]} source={{uri:getPicUri(ideas[frontIdea])} } resizeMode="cover"/>
           
      </Animated.View>
      <Animated.View style = {{
        backgroundColor:"rgb(50,50,50)",
        height:detailsModeAnim.interpolate({inputRange:[0,1], outputRange:["0%","50%"]})}
      }>
        
      </Animated.View>
     
    </View>
    </View>
  );
}
function onTapPic(myHt,isDetailsMode, setIsDetailsMode){
  console.log("tappa")
  console.log("isDetialsMode1" + isDetailsMode)
  let DesiredMode = !isDetailsMode
 
  let target = DesiredMode? 1:0
  setIsDetailsMode(DesiredMode)

   
  Animated.timing( myHt,{
    toValue:target,
    duration:200,
    useNativeDriver:false,
    easing:Easing.quad
  }).start()
}

function getPicUri( idea ){
    return "https://www.stirfrygames.com/img/" +idea.photos[0].photo_reference+ ".jpg";
    
}

const styles = StyleSheet.create({
  container: {
  //  flex: 1,
    width:"100%",
    height:"90%",
  
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