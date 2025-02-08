function playSound(url) {
    const audio = new Audio(`./sounds/${url}`);
    audio.play();
  }


function playCapSound(n){
    if(n === 0){return}
    if(n <= 3){
        playSound(`cap${n}.mp3`)
    }else{
        playSound("capn.mp3")
    }
}

function playPlaceSound(){
    const sound_number = getRandomInt(1,4)
    playSound(`place${sound_number}.mp3`)
}


function playThinkSound(){
    const sound_number = getRandomInt(1,4)
    playSound(`thinking${sound_number}.mp3`)
}

function playEndGame(){
    playSound("endgame.mp3")
}
