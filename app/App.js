import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { Animated, View, StyleSheet, PanResponder, Text, Image, Easing, Dimensions, TouchableHighlight } from "react-native";


let msg = "Loading..."

const App = () => {
  const [frontIdea, setFrontIdea] = useState(0);
  const [nextIdea, setNextIdea] = useState(1);

  const mypos = useRef(new Animated.ValueXY()).current;
  const detailsModeAnim = useRef(new Animated.Value(0)).current
  const [loaded, setLoaded] = useState(false);
  const [touchTime, setTouchTime] = useState(0);
  const [isDetailsMode, setIsDetailsMode] = useState(false);
  const [ideas, setIdeas] = useState(null)

  const [fetchStarted, setFetchStarted] = useState(false)
  const [msg,setMsg] = useState("loading..")
  
  if (ideas == null){
    return fetchIdeas(setIdeas, fetchStarted, setFetchStarted, msg, setMsg)
  }
    
  const onSwipeAnimEnded = ()=>{
     //swipe animation is over
     setLoaded(false)  // this will hide the front pic until it it loaded
     setFrontIdea(nextIdea) // start loading the front pic
     mypos.setValue({ x: 0, y: 0 });
     Image.prefetch(getPicUri(ideas[nextIdea + 1]%ideas.length))
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (ev, gestureState) => {
      setTouchTime((new Date()).getTime())
      return true
    },
    onPanResponderMove: (event, gesture) => {
      if (isDetailsMode) return
      mypos.setValue({ x: gesture.dx * .8, y: 0 })
    },
    onPanResponderRelease: (event, gesture) => {
      if ((new Date()).getTime() - touchTime < 150 && gesture.vx < .1 && gesture.vy < .1 && Math.abs(gesture.dx) < 10 && Math.abs(gesture.dy) < 10) {
        // picture tapped, enter or exit details mode
        onTapPic(detailsModeAnim, isDetailsMode, setIsDetailsMode)
        return  
      }
      if (isDetailsMode) return // no swiping in details mode

      if (Math.abs(gesture.vx) > 0.15 || Math.abs(gesture.dx) > Dimensions.get('window').width * .5) {
        // swipe occured, launch the card off the screen
        let target = Dimensions.get('window').width;
        if (mypos.x._value < 0) {
          target *= -1;
        }

        Animated.timing(mypos, { toValue: { x: target, y: 0 }, duration: 100,  useNativeDriver: false, easing: Easing.linear})
          .start( onSwipeAnimEnded )

      } else {
        // no swipe occured, lets animated back to center all the time
        Animated.timing(mypos, { toValue: { x: 0, y: 0 }, duration: 125, useNativeDriver: false, easing: Easing.ease}).start()
      }
    }
  });

  return (
    <View style={{ backgroundColor: "black", height: "100%" }}>
      <View style={styles.container} >
        
        <Image style={[styles.ideaCard]} source={{ uri: getPicUri(ideas[nextIdea]) }} resizeMode="cover" />

        <Animated.View
          style={[mypos.getLayout(), {
            width: "100%",
            overflow: "hidden",
            height: detailsModeAnim.interpolate({ inputRange: [0, 1], outputRange: ["100%", "50%"] }),
            transform: [{
              translateY: detailsModeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0]  // 0 : 150, 0.5 : 75, 1 : 0
            })}]
          }]} {...panResponder.panHandlers}>
        
          <Animated.Image 
            style={[styles.ideaCard,loaded ? {} : { display: 'none' }]} 
            source={{ uri: getPicUri(ideas[frontIdea]) }} 
            resizeMode="cover" 
            onLoad={() => {
              if ( !loaded){
                setNextIdea((nextIdea +1) % ideas.length)
              }
              setLoaded(true);
            }}
          />
        </Animated.View>

        { renderDetailsMode(ideas[frontIdea], detailsModeAnim)}
 
      </View>
    </View>
  );
}

function onTapPic(myHt, isDetailsMode, setIsDetailsMode) {

  let DesiredMode = !isDetailsMode

  let target = DesiredMode ? 1 : 0
  setIsDetailsMode(DesiredMode)

  Animated.timing(myHt, {
    toValue: target,
    duration: 200,
    useNativeDriver: false,
    easing: Easing.quad
  }).start()
}

function getPicUri(idea) {
  if (idea.photos && idea.photos.length > 0)
    return "https://www.stirfrygames.com/img/960/" + idea.photos[0].photo_reference + "-960.jpg";
  return "https://cdn4.vectorstock.com/i/thumb-large/19/58/no-image-vector-30371958.jpg"

}

function renderDetailsMode(idea, anim ){
  let textStyle={ color: "white", opacity: anim }
  return (
    <Animated.View style={{
      backgroundColor: "rgb(50,50,50)",
      height: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "50%"] }),
      justifyContent: "center",
      alignItems: "center"
    }}>
          
          <Animated.Text style={textStyle}>{idea.name}</Animated.Text>
          <Animated.Text style={textStyle}>{idea.vicinity}</Animated.Text>
          <Animated.Text style={textStyle}>{distanceToMe(idea).toFixed(2)} km</Animated.Text>
    </Animated.View>)
}

const styles = StyleSheet.create({
  container: {
    //  flex: 1,
    width: "100%",
    height: "90%",

  },
 
  ideaCard: {
    position: "absolute",
    height: "100%",
    width: "100%",
    borderRadius: 15
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "bold"
  }
 
});

function distanceToMe(idea){
  const GuelphLocation = { lat: 43.544878, lng: -80.248004 }
  return getDistanceFromLatLonInKm( GuelphLocation.lat, GuelphLocation.lng, idea.geometry.location.lat, idea.geometry.location.lng)
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
function fetchIdeas(setIdeas, fetchStarted, setFetchStarted, msg, setMsg){
 
  
  if ( !fetchStarted){
    setFetchStarted(true)
    fetch('https://your-server.example.com/places', { 
      method: 'get', 
      headers: new Headers({
        'Authorization': 'CHANGE_ME_APP_KEY'
       })})
    .then((response) => {
      if ( response.status != 200 ){
        throw "Response Status: "+ response.status
      }
      return response.json()
    })
    .then((json) => {     
      console.log(json)
      setIdeas(json)
    
    })
    .catch((error) => {
      console.error(error);
      setMsg( error.toString());
      setIdeas(null)
     
    });
  }

  
    return (
      <View style={{   backgroundColor: "rgb(50,50,50)",   justifyContent: "center", alignItems:"center",height:"100%"}}>
      <Text style ={{color: "white"}}>{msg}</Text>
      </View>
    ); 
  
}
export default App;