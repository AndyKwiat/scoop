import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { Switch,
  Pressable, Button, Animated, View, StyleSheet, PanResponder, Text, Image, Easing, Dimensions } from "react-native";

import { FavoriteButton } from "./Favorites"
function log ( ...str ){
  console.log(...str)
}

const App = () => {
  const [frontIdea, setFrontIdea] = useState(0);
  const [nextIdea, setNextIdea] = useState(1);
  const [prevIdea, setPrevIdea ] = useState(2)
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  
  

  const mypos = useRef(new Animated.ValueXY()).current;
  const detailsModeAnim = useRef(new Animated.Value(0)).current
  const [loaded, setLoaded] = useState(false);
  const [touchTime, setTouchTime] = useState(0);
  const [isDetailsMode, setIsDetailsMode] = useState(false);
  const [ideas, setIdeas] = useState(null)
  const [allIdeas, setAllIdeas] = useState(null)

  const [fetchStarted, setFetchStarted] = useState(false)
  const [showingSettings,setShowingSettings]= useState(false)
  const [msg,setMsg] = useState("loading..")
  

  if (allIdeas == null){
    return fetchIdeas(setAllIdeas, fetchStarted, setFetchStarted, msg, setMsg)
  }

  if (ideas == null){
    let filteredIdeas = allIdeas.filter(x=>distanceToMe(x) < 20)
    setIdeas(filteredIdeas)
    setPrevIdea(filteredIdeas.length-1) // frontIdea = 0, nextIdea=1 by default
    setNextIdea(1) // frontIdea = 0, nextIdea=1 by default
    setFrontIdea(0)
    return
  }

  function currentIdea(){
    return ideas[frontIdea]
  }

    
  const onSwipeAnimEnded = (delta)=>{
     //swipe animation is over
     setLoaded(false)  // this will hide the front pic until it it loaded
     
     let wrap = (num)=>{
        if ( num < 0 ){
          num+= ideas.length
        }
        if ( num >= ideas.length ){
          num -= ideas.length;
        }
        return num;
     }
     
     let curIdea = frontIdea + delta

     setFrontIdea( wrap(curIdea) )
     let next = wrap(curIdea+1)
     setNextIdea( next)
     let prev = wrap(curIdea-1)
     setPrevIdea( prev)

     setCurrentPhotoIdx(0)
     mypos.setValue({ x: 0, y: 0 });
     log( "NEXT",next," LEN", ideas.length )
     Image.prefetch(getPicUri(ideas[next],0))
     Image.prefetch(getPicUri(ideas[prev],0))
  }

  function onGearPressed(){
    setIsDetailsMode( !isDetailsMode )
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
        // tap left side look at diff pic in same idea
        if ( gesture.moveX < Dimensions.get('window').width * 0.3 ){
          let idx= currentPhotoIdx-1;
          if ( idx < 0 ) idx += currentIdea().photos.length;
          setCurrentPhotoIdx( idx )
          idx-=1
          if ( idx < 0 ) idx += currentIdea().photos.length;
          Image.prefetch(getPicUri(currentIdea(),idx))
          return
        }
        // tap right side look at diff pic in same idea
        if ( gesture.moveX > Dimensions.get('window').width * 0.7 ){
          setCurrentPhotoIdx( (currentPhotoIdx+1)% currentIdea().photos.length )
          Image.prefetch(getPicUri(currentIdea(),(currentPhotoIdx+2)% currentIdea().photos.length))
          return
        }
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
          .start( ()=>{ onSwipeAnimEnded( -Math.sign(target))} )

      } else {
        // no swipe occured, lets animated back to center all the time
        Animated.timing(mypos, { toValue: { x: 0, y: 0 }, duration: 125, useNativeDriver: false, easing: Easing.ease}).start()
      }
    }
  });

  return (
    <View style={{ backgroundColor: "black", height: "100%" }}>
      <View style={styles.container} >
        
   
      
        <Animated.View
          style={[mypos.getLayout(), {
            width: "100%",
            //overflow: "hidden",
            height: detailsModeAnim.interpolate({ inputRange: [0, 1], outputRange: ["100%", "50%"] }),
            transform: [{
              translateY: detailsModeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0]  // 0 : 150, 0.5 : 75, 1 : 0
            })}]
          }]} {...panResponder.panHandlers}>
           
          <Animated.Image 
            style={[styles.ideaCard,loaded ? {} : { 
              //display: 'none' 
          }]} 
            source={{ uri: getPicUri(ideas[frontIdea], currentPhotoIdx) }} 
            resizeMode="cover" 
            onLoad={() => {
            
       
           
              setLoaded(true);
            }}
          />

          <Animated.Image 
            style={[styles.ideaCard,{width:"100%",height:"100%",left:"100%"}]} 
            source={{ uri: getPicUri(ideas[nextIdea], currentPhotoIdx) }} 
            resizeMode="cover" 
           
          />

        <Animated.Image 
            style={[styles.ideaCard,{width:"100%",height:"100%",left:"-100%"}]} 
            source={{ uri: getPicUri(ideas[prevIdea], currentPhotoIdx) }} 
            resizeMode="cover" 
           
          />

        

        <Animated.Text style={styles.cardText}>{ideas[frontIdea].name}</Animated.Text>
       
        </Animated.View>
        
        <PhotoDots idea={ideas[frontIdea]} currentPhotoIdx={currentPhotoIdx}/>

        { renderDetailsMode(ideas[frontIdea], detailsModeAnim)}

       
      </View>

      <Pressable onPress={()=>{setShowingSettings(!showingSettings)}}>
        <Text style={styles.gearButton}>&#9881;</Text>
    </Pressable>
<FavoriteButton ideaId={ideas[frontIdea].id}/>



    <SettingsPage showingSettings={showingSettings} setFrontIdea={setFrontIdea} setNextIdea={setNextIdea} setPrevIdea={setPrevIdea} setShowingSettings={setShowingSettings} setIdeas={setIdeas} allIdeas={allIdeas}/>

    </View>
  );
}

function SettingsPage({showingSettings, setShowingSettings, allIdeas, setIdeas,setFrontIdea, setNextIdea,setPrevIdea } ){
  const [filters,setFilters] = useState({bar:true, gym:true, library:true , museum:true, park:true, art_gallery:true, other:true})
  if (!showingSettings )  return null
  let isEnabled = true
  function donePressed(){
      setShowingSettings( false )
      let ideas = allIdeas.filter(x=>distanceToMe(x) < 20)
      ideas = ideas.filter( idea=>{
   
        for (const category in filters ){
          if ( idea.types.includes(category) ){
            if ( filters[category] ) return true; // if we match any filters keep the idea
          }
        }
        return filters.other; // don't match anything, we call you 'other'
      })
      shuffleArray(ideas)
      setIdeas(ideas)
      setFrontIdea(0)
      setNextIdea(1)
      setPrevIdea(ideas.length-1)
  }
  function toggleSwitch(key){
    let f ={}
    Object.assign(f, filters)
    f[key] = !f[key]
    setFilters(f)
  }
  return (
    <View style={styles.settingsContainer}>
      <Text >SETTTTTTINGS!!!</Text>

      {Object.keys(filters).map((f2,i)=>{
      return(
      <View key={i} style={{padding:15,marginTop:10, width:"35%"}}>
      <Text style={{top:0,position:"absolute"}}>{f2.toUpperCase()}</Text>
      <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
         
          onValueChange={()=>{toggleSwitch(f2)}}
          value={filters[f2]}
          
          style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
          position: "absolute",
          right:0
           }}
        />
      </View>)})}

        <Button
        onPress={donePressed}
  style={{marginTop:35}}
  title="Done"
/>
     </View>
  )
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

function getPicUri(idea,photoIndex) {
 
  const res = "960";
  if (idea.photos && idea.photos.length > 0){
    let pic = "https://www.stirfrygames.com/img/"+res+"/" + idea.photos[photoIndex%idea.photos.length].photo_reference + "-"+res+".jpg";
    console.log("pic check: " + pic )
    return pic;
  }
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
  settingsContainer:{
    width:"100%",
    height:"100%",
    backgroundColor:"grey",
    position:"absolute",
    alignItems: "center",
    justifyContent: "center"
  },
  cardText:{
    position:"absolute",
    color:"white",
    paddingTop:"20%",
    paddingLeft:10,
    fontSize:18,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
  textShadowOffset: {width: -1, height: 1},
  textShadowRadius: 2
  },
  gearButton:{ // position:"absolute",
    color:"white",
    right:0,
    textAlign:"right",
    fontSize:38},
 
  ideaCard: {
    position: "absolute",
    height: "100%",
    width: "100%",
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,1)'
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "bold"
  },
  reverseShadow:{
    textShadowColor: 'rgba(99, 99, 99, 0.75)',
    textShadowOffset: {width: -2, height: 2},
    textShadowRadius: 1,
    color:"black",
  },
  frontShadow:{
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -2, height: 2},
    textShadowRadius: 1,
    color:"white",
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
function PhotoDots({idea, currentPhotoIdx}){
  if ( idea.photos.length <=1 ) return null;
  return (
    <Text style={{  position:"absolute",
    color:"white",
    right:0,
    fontSize:38,
   
    paddingTop:"10%", }}>{idea.photos.map((obj,i)=><Text key={i} 
    style={(i==currentPhotoIdx)?styles.frontShadow:styles.reverseShadow}>&#8226;</Text>)}</Text>

  )
}

export default App;