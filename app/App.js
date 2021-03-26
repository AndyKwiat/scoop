import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { Animated, View, StyleSheet, PanResponder, Text, Image, Easing, Dimensions, TouchableHighlight } from "react-native";

let ideas = null;
let msg = "kewl"

const App = () => {


  const [frontIdea, setFrontIdea] = useState(0);
  const [nextIdea, setNextIdea] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const mypos = useRef(new Animated.ValueXY()).current;
  const detailsModeAnim = useRef(new Animated.Value(0)).current
  const [loaded, setLoaded] = useState(false);
  const [touchTime, setTouchTime] = useState(0);
  const [isDetailsMode, setIsDetailsMode] = useState(false);

  if ( !isReady){
    
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
      ideas = json.Items;
      //shuffleArray(ideas)
      setIsReady(true)
     // return json.movies;
    })
    .catch((error) => {
      console.error(error);
      msg = error.toString();

      ideas = null;
      setIsReady(true);
    });
    return (
      <View style={{   backgroundColor: "rgb(50,50,50)",   justifyContent: "center", alignItems:"center",height:"100%"}}>
      <Text style ={{color: "white"}}>Fetching Data...</Text>
      </View>
    );
  }
  if ( ideas == null ){
    return (
      <View style={{   backgroundColor: "rgb(50,50,50)",   justifyContent: "center", alignItems:"center",height:"100%"}}>
      <Text style ={{color: "white"}}>{msg}</Text>
      </View>
    ); 
  }
  

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (ev, gestureState) => {
      setTouchTime((new Date()).getTime())

      return true
    },
    onPanResponderMove: (event, gesture) => {

      if (isDetailsMode) {
        return
      }
      mypos.setValue({ x: gesture.dx * .8, y: 0 });
      // }

    },
    onPanResponderRelease: (event, gesture) => {
      if ((new Date()).getTime() - touchTime < 150 && gesture.vx < .1 && gesture.vy < .1 && Math.abs(gesture.dx) < 10 && Math.abs(gesture.dy) < 10) {

        onTapPic(detailsModeAnim, isDetailsMode, setIsDetailsMode)
        return
      }
      if (isDetailsMode) return


      if (Math.abs(gesture.vx) > 0.15 || Math.abs(gesture.dx) > Dimensions.get('window').width * .5) {
        // swipe occured, launch the card off the screen
        let target = Dimensions.get('window').width;
        if (mypos.x._value < 0) {
          target *= -1;
        }
        Animated.timing(mypos, {
          toValue: { x: target, y: 0 },
          duration: 100,
          useNativeDriver: false,
          easing: Easing.linear
        }).start(() => {
          //swipe is over
         setLoaded(false)

          setFrontIdea(nextIdea)
          
          mypos.setValue({ x: 0, y: 0 });

          Image.prefetch(getPicUri(ideas[nextIdea + 1]%ideas.length))

        })



        //    console.log(`${frontIdea} is the front idea` + JSON.stringify(mypos))

      } else {
        Animated.timing(mypos, {
          toValue: { x: 0, y: 0 },
          duration: 125,
          useNativeDriver: false,
          easing: Easing.ease
        }).start()
      }
    }
  });

  console.log("idea" + frontIdea)



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
              })
            }]
          }]}
          {...panResponder.panHandlers}
        >

          <Animated.Image style={[styles.ideaCard,
        
          loaded ? {} : { display: 'none' }
          ]} source={{ uri: getPicUri(ideas[frontIdea]) }} resizeMode="cover" onLoad={() => {
            if ( !loaded){
            setNextIdea((nextIdea +1) % ideas.length)
            }
            setLoaded(true);
            
            }
          }/>

        </Animated.View>

       
        <Animated.View style={{
          backgroundColor: "rgb(50,50,50)",
          height: detailsModeAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "50%"] }),
          justifyContent: "center",
          alignItems: "center"
        }
        }>
            <Animated.Text style={{
              color: "white",
              opacity: detailsModeAnim
            }}>{ideas[frontIdea].name}</Animated.Text>
            <Animated.Text style={{
              color: "white",
              opacity: detailsModeAnim
            }}>{ideas[frontIdea].vicinity}</Animated.Text>
        </Animated.View>

      </View>
    </View>
  );
}
function onTapPic(myHt, isDetailsMode, setIsDetailsMode) {
  console.log("tappa")
  console.log("isDetialsMode1" + isDetailsMode)
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
    return "https://www.stirfrygames.com/img/" + idea.photos[0].photo_reference + "-125.jpg";
  return "https://cdn4.vectorstock.com/i/thumb-large/19/58/no-image-vector-30371958.jpg"

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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export default App;