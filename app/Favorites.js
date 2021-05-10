import React, {  useState ,useEffect} from "react";
import { Pressable, Text } from "react-native";
  

export const FavoriteButton = ({ideaId})=>{
    const [likedList, setLikedList] = useState({})
    useEffect(()=>{
        loadList().then((l)=>{
            setLikedList(l);
        }).catch(e=>{})
    },[])   // empty array means no dependencies so it'll run once

    function onLikeButtonPress( id ){
 
        if (  likedList[id] ){
          likedList[id]=false;
        }else{
        likedList[id]=true;
        }
        let target = {}
        target = Object.assign(target, likedList)
        setLikedList(target)
        saveList(likedList)
        
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

function saveList(list){
    storage.save({
        key:"scoop-faveList",
        data: list,
        expires:null
    })
}

function loadList(){
    return storage.load({
        "key":"scoop-faveList",
        "autoSync":false
    })
}

import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-community/async-storage';

const storage = new Storage({
  // maximum capacity, default 1000 key-ids
  size: 100,

  // Use AsyncStorage for RN apps, or window.localStorage for web apps.
  // If storageBackend is not set, data will be lost after reload.
  storageBackend: AsyncStorage, // for web: window.localStorage

  // expire time, default: 1 day (1000 * 3600 * 24 milliseconds).
  // can be null, which means never expire.
  defaultExpires: 1000 * 3600 * 24,

  // cache data in the memory. default is true.
  enableCache: true,

  // if data was not found in storage or expired data was found,
  // the corresponding sync method will be invoked returning
  // the latest data.
  sync: {
    // we'll talk about the details later.
  }
});