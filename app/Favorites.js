import { AsyncStorage } from 'react-native';
import React, {  useState } from "react";
import { Pressable, Text } from "react-native";
  

export const FavoriteButton = ({ideaId})=>{
    const [likedList, setLikedList] = useState({})
    function onLikeButtonPress( id ){
 
        if (  likedList[id] ){
          likedList[id]=false;
        }else{
        likedList[id]=true;
        }
        let target = {}
        target = Object.assign(target, likedList)
        setLikedList(target)
        alert("ideaid" + ideaId )
        console.log(ideaId)
      }
     let likeButtonStyle={
        cursor: "pointer" ,
        position:"absolute",
        top:"-50%",
        textAlign:"center",
        color:"white",
        fontWeight:"bold",
        //paddingTop:"20%",
        fontSize:28,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 2
      }

    return (
        <Pressable onPress={()=>{onLikeButtonPress(ideaId)}}>
          <Text style={likeButtonStyle}>	
          {likedList[ideaId]?String.fromCharCode(10084):String.fromCharCode(9825)}
             </Text>
        </Pressable>
    )
}