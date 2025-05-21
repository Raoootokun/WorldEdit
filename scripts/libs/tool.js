import { world } from "@minecraft/server";

/**
 * @param {*} value 
 * @param {boolean} isOrganize 値を整頓して表示する
 * @returns 
 */
export function log(value, isOrganize) {
    if(typeof value == `string`)return world.sendMessage(value);

    if(isOrganize)return world.sendMessage(`${JSON.stringify(value, null, 2)}`);
    world.sendMessage(`${JSON.stringify(value)}`);
};

/**
 * @param {any[]} array 
 */
export function aryShuffle(array) {
    const cloneAry = [...array];
    for(let i=cloneAry.length-1; i>=0; i--){
        let rand = Math.floor(Math.random() * (i+1));
        let tmpStorage = cloneAry[i];
        cloneAry[i] = cloneAry[rand];
        cloneAry[rand] = tmpStorage;
    };
    return cloneAry;
};

export function getFacing(target) {
    if(!target)return;
    const rota = target.getRotation();
  
    if(rota.y >= -135 && rota.y <= -45){
        return "x";
    }else if(rota.y >= -45 && rota.y <= 45){
        return "z";
    }else if(rota.y >= 45 && rota.y <= 135){
        return "-x";
    }else if((rota.y >= 135 && rota.y <= 180) || (rota.y >= -180 && rota.y <= -135)){
        return "-z";
    };
};


export function getDate() {
    const date_ = new Date();
    const d = {
        month: date_.getMonth()+1,
        date: date_.getDate(),
        hours: date_.getHours()+9,
        minutes: date_.getMinutes(),
        secconds: date_.getSeconds()
    };
    return `${d.month}/${d.date}/${d.hours}:${d.minutes}`;
};

export function getSpeed(player) {
    const velocity = player.getVelocity();

    return Vector.distance({x:0,y:0,z:0}, velocity)*20
};

export function spawnParticle(target, particleId, location, molang) {
    try{
        target.spawnParticle(particleId, location, molang);
    }catch(e){
        return false;
    };
};

/**
 * 
 * @param {Player} player 
 * @param {string} actionbarText 
 * @param {string[]} siderbarTextArray 
 */
export function showText(player, actionbarText, siderbarTextArray) {

    //70文字なるように空白を追加
    const cnt = 70 - getByte(actionbarText);

    let txt = ``;
    for(let i=0; i<cnt; i++) {
        if(i == Math.floor(cnt/2))txt = txt + actionbarText;
        txt = txt + " ";
    };
    txt = txt + siderbarTextArray.join(`\n§r`);

    player.onScreenDisplay.setActionBar(txt);
};

/**
 * @param {string} string 
 * @returns 
 */
export function getByte(string) {
    var l = 0;
    for(var i=0; i<str.length; i++) {
        var c = string.charCodeAt(i);
        if(string[i] == `§` || (c >= 0x0 && c < 0x81) || (c === 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
            l += 1;
            if(string[i-1] == `§`)l += 1;
        }else {
            l += 3;
        };
    };
    return l;
};

/**
 * @param {number} number1 
 * @param {number} number2 
 * @param {boolean} isFloor 
 * @returns {number}
 */
export function random(number1, number2, isFloor) {
    const max = Math.max(...[number1, number2]);
    const min = Math.min(...[number1, number2]);

    if(isFloor){
        return Math.floor(Math.random() * (max + 1 - min)) + min;
    }else{
        return min + (max-min) * Math.random();
    };
};

/**
 * @param {number} angleY 
 * @returns {Vector3}
 */
export function angleToVector(angleY) {
    const d = -(angleY);
    const radian = d * (Math.PI / 180);
    const x = Math.cos(radian) * 1;
    const z = Math.sin(radian) * 1;
  
    return { x:z, y:0, z:x };
};

/**
 * 
 * @param {Player} player 
 * @returns {Vector3}
 */
function getInputVector(player) {
    // //入力キーを移動方向ベクトルに変換
    // const rawVec = player.inputInfo.getMovementVector();//入力キーのvec2 > Z軸:x, X軸:y
    // const viewVec = player.getViewDirection();//向いてる方向:vec3
    // const offSet = Vector.offsetDirct(player.location, { x:rawVec.x, y:0, z:rawVec.y }, viewVec);

    // const VECTOR = Vector.normalize(Vector.subtract(offSet, player.location));

    // //入力キーが押されてなかったら
    // if(!VECTOR.x || !VECTOR.z) {
    //     return { x:0, y:0, z:0 }; 
    // };

    // return { x:VECTOR.x, y:0, z:VECTOR.z }; 
};

