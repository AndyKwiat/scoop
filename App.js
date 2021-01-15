import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { Animated, View, StyleSheet, PanResponder, Text, Image, Easing, Dimensions, TouchableHighlight } from "react-native";
let pics = ["https://homepages.cae.wisc.edu/~ece533/images/airplane.png",
  "https://static-ssl.businessinsider.com/image/5d9b5bff52887931e8497a36-1405/141222twnmustang.jpg",
  "https://d33wubrfki0l68.cloudfront.net/200d166fc3dff29e5b8a6703d8e83cc25821bcf4/10dd6/media/2018/08/kitten.jpg",
  "https://guelphpolitico.files.wordpress.com/2020/02/misersky_dogpark-e1582571255961.jpg?w=940",
  "https://geo0.ggpht.com/maps/photothumb/fd/v1?bpb=ChEKD3NlYXJjaC5nd3MtcHJvZBIgChIJg41l1rWaK4gRQ_nNQZ4p_78qCg0AAAAAFQAAAAAaBgjwARCYAw&gl=CA",
  "https://www.stirfrygames.com/img/ATtYBwIEv71DK4B8CVkwyNTTSnNqsjbMla4Gq3L98wa968u4iUVfEtJ6yGOj5XFwliHLel123dVwB3rr6CH9GWHXukYP0TVlfuuIOsNAQRK5mFtkznGt1QGYaMYv3-bz8ENicrBs6VgUXxCNV__5okHI3ZpILpxegRdtHQBtfVFo-2LOtgEG.jpg"]

const ideasRaw = []
ideasRaw[0] = require('./ideas.parks.json');
ideasRaw[1] = require('./ideas.bars.json');
ideasRaw[2] = require('./ideas.night_club.json');
ideasRaw[3] = require('./ideas.tourist_attraction.json');
const ideas = ideasRaw[0].results.concat(ideasRaw[1].results, ideasRaw[2].results, ideasRaw[3].results);
shuffleArray(ideas)
const App = () => {


  const [frontIdea, setFrontIdea] = useState(0);
  const [nextIdea, setNextIdea] = useState(1);
  const mypos = useRef(new Animated.ValueXY()).current;
  const detailsModeAnim = useRef(new Animated.Value(0)).current

  const [opacity, setOpacity] = useState(1);
  const [touchTime, setTouchTime] = useState(0);

  const [isDetailsMode, setIsDetailsMode] = useState(false);

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
         
          setOpacity(0);

          setFrontIdea(nextIdea)
          
          mypos.setValue({ x: 0, y: 0 });


          Image.prefetch(getPicUri(ideas[nextIdea + 1]))

          // setOpacity(1);
          setTimeout(() => {
            setOpacity(1);
            setNextIdea((nextIdea + 1) % ideas.length)
          }, 10);

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
          {
            opacity: opacity
          }]} source={{ uri: getPicUri(ideas[frontIdea]) }} resizeMode="cover" />

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
    return "https://www.stirfrygames.com/img/" + idea.photos[0].photo_reference + ".jpg";
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