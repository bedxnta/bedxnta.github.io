gdjs.cps_32sceneCode = {};
gdjs.cps_32sceneCode.localVariables = [];
gdjs.cps_32sceneCode.GDtxt_9595cpsObjects1= [];
gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2= [];
gdjs.cps_32sceneCode.GDtxt_9595cpsObjects3= [];
gdjs.cps_32sceneCode.GDtxt_9595funtooObjects1= [];
gdjs.cps_32sceneCode.GDtxt_9595funtooObjects2= [];
gdjs.cps_32sceneCode.GDtxt_9595funtooObjects3= [];
gdjs.cps_32sceneCode.GDtxt_9595tipObjects1= [];
gdjs.cps_32sceneCode.GDtxt_9595tipObjects2= [];
gdjs.cps_32sceneCode.GDtxt_9595tipObjects3= [];
gdjs.cps_32sceneCode.GDbtn_9595sndObjects1= [];
gdjs.cps_32sceneCode.GDbtn_9595sndObjects2= [];
gdjs.cps_32sceneCode.GDbtn_9595sndObjects3= [];
gdjs.cps_32sceneCode.GDtxt_9595sndObjects1= [];
gdjs.cps_32sceneCode.GDtxt_9595sndObjects2= [];
gdjs.cps_32sceneCode.GDtxt_9595sndObjects3= [];
gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects1= [];
gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects2= [];
gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects3= [];


gdjs.cps_32sceneCode.eventsList0 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtsExt__Gamepads__C_any_button_released.func(runtimeScene, 1, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined));
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("txt_cps"), gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2);
gdjs.copyArray(runtimeScene.getObjects("txt_tip"), gdjs.cps_32sceneCode.GDtxt_9595tipObjects2);
{for(var i = 0, len = gdjs.cps_32sceneCode.GDtxt_9595tipObjects2.length ;i < len;++i) {
    gdjs.cps_32sceneCode.GDtxt_9595tipObjects2[i].deleteFromScene(runtimeScene);
}
}{runtimeScene.getGame().getVariables().getFromIndex(0).add(1);
}{gdjs.evtTools.sound.playSoundOnChannel(runtimeScene, "snd_click.wav", 1, false, 100, 1);
}{for(var i = 0, len = gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2.length ;i < len;++i) {
    gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[i].returnVariable(gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[i].getVariables().getFromIndex(0)).setNumber(1);
}
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("txt_cps"), gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2.length;i<l;++i) {
    if ( gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[i].getVariableNumber(gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[i].getVariables().getFromIndex(0)) > 0 ) {
        isConditionTrue_0 = true;
        gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[k] = gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[i];
        ++k;
    }
}
gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2 */
{for(var i = 0, len = gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2.length ;i < len;++i) {
    gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[i].getBehavior("Scale").setScale(1 + (gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[i].getVariables().getFromIndex(0).getAsNumber() * 0.3));
}
}{for(var i = 0, len = gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2.length ;i < len;++i) {
    gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[i].returnVariable(gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[i].getVariables().getFromIndex(0)).sub(gdjs.evtTools.runtimeScene.getElapsedTimeInSeconds(runtimeScene) * 2);
}
}}

}


{

gdjs.copyArray(runtimeScene.getObjects("txt_cps"), gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2.length;i<l;++i) {
    if ( gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[i].getVariableNumber(gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[i].getVariables().getFromIndex(0)) <= 0 ) {
        isConditionTrue_0 = true;
        gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[k] = gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[i];
        ++k;
    }
}
gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2.length = k;
if (isConditionTrue_0) {
/* Reuse gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2 */
{for(var i = 0, len = gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2.length ;i < len;++i) {
    gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2[i].getBehavior("Scale").setScale(1);
}
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.getTimerElapsedTimeInSecondsOrNaN(runtimeScene, "CPSTimer") >= 1;
if (isConditionTrue_0) {
{runtimeScene.getGame().getVariables().getFromIndex(1).setNumber(runtimeScene.getGame().getVariables().getFromIndex(0).getAsNumber());
}{runtimeScene.getGame().getVariables().getFromIndex(0).setNumber(0);
}{gdjs.evtTools.runtimeScene.resetTimer(runtimeScene, "CPSTimer");
}}

}


{


let isConditionTrue_0 = false;
{
gdjs.copyArray(runtimeScene.getObjects("txt_cps"), gdjs.cps_32sceneCode.GDtxt_9595cpsObjects1);
{for(var i = 0, len = gdjs.cps_32sceneCode.GDtxt_9595cpsObjects1.length ;i < len;++i) {
    gdjs.cps_32sceneCode.GDtxt_9595cpsObjects1[i].getBehavior("Text").setText(gdjs.evtTools.common.toString(runtimeScene.getGame().getVariables().getFromIndex(1).getAsNumber()) + " CCPS ");
}
}}

}


};gdjs.cps_32sceneCode.eventsList1 = function(runtimeScene) {

{

gdjs.copyArray(runtimeScene.getObjects("btn_snd"), gdjs.cps_32sceneCode.GDbtn_9595sndObjects2);

let isConditionTrue_0 = false;
isConditionTrue_0 = false;
for (var i = 0, k = 0, l = gdjs.cps_32sceneCode.GDbtn_9595sndObjects2.length;i<l;++i) {
    if ( gdjs.cps_32sceneCode.GDbtn_9595sndObjects2[i].getBehavior("ButtonFSM").IsClicked((typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined)) ) {
        isConditionTrue_0 = true;
        gdjs.cps_32sceneCode.GDbtn_9595sndObjects2[k] = gdjs.cps_32sceneCode.GDbtn_9595sndObjects2[i];
        ++k;
    }
}
gdjs.cps_32sceneCode.GDbtn_9595sndObjects2.length = k;
if (isConditionTrue_0) {
{gdjs.evtTools.variable.toggleVariableBoolean(runtimeScene.getGame().getVariables().getFromIndex(3));
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = runtimeScene.getGame().getVariables().getFromIndex(3).getAsBoolean();
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("txt_snd"), gdjs.cps_32sceneCode.GDtxt_9595sndObjects2);
{gdjs.evtTools.sound.setGlobalVolume(runtimeScene, 100);
}{for(var i = 0, len = gdjs.cps_32sceneCode.GDtxt_9595sndObjects2.length ;i < len;++i) {
    gdjs.cps_32sceneCode.GDtxt_9595sndObjects2[i].getBehavior("Text").setText("SOUND: ON");
}
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
{isConditionTrue_0 = !runtimeScene.getGame().getVariables().getFromIndex(3).getAsBoolean();
}
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("txt_snd"), gdjs.cps_32sceneCode.GDtxt_9595sndObjects1);
{gdjs.evtTools.sound.setGlobalVolume(runtimeScene, 0);
}{for(var i = 0, len = gdjs.cps_32sceneCode.GDtxt_9595sndObjects1.length ;i < len;++i) {
    gdjs.cps_32sceneCode.GDtxt_9595sndObjects1[i].getBehavior("Text").setText("SOUND: OFF");
}
}}

}


};gdjs.cps_32sceneCode.eventsList2 = function(runtimeScene) {

{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtTools.runtimeScene.sceneJustBegins(runtimeScene);
if (isConditionTrue_0) {
{gdjs.evtTools.runtimeScene.resetTimer(runtimeScene, "CPSTimer");
}{gdjs.evtTools.window.setWindowSize(runtimeScene, 800, 600, true);
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = !(gdjs.evtsExt__Gamepads__C_Controller_X_is_connected.func(runtimeScene, 1, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined)));
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("txt_controllernc"), gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects1);
{for(var i = 0, len = gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects1.length ;i < len;++i) {
    gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects1[i].hide(false);
}
}}

}


{


let isConditionTrue_0 = false;
isConditionTrue_0 = false;
isConditionTrue_0 = gdjs.evtsExt__Gamepads__C_Controller_X_is_connected.func(runtimeScene, 1, (typeof eventsFunctionContext !== 'undefined' ? eventsFunctionContext : undefined));
if (isConditionTrue_0) {
gdjs.copyArray(runtimeScene.getObjects("txt_controllernc"), gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects1);
{for(var i = 0, len = gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects1.length ;i < len;++i) {
    gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects1[i].hide();
}
}}

}


{


gdjs.cps_32sceneCode.eventsList0(runtimeScene);
}


{


gdjs.cps_32sceneCode.eventsList1(runtimeScene);
}


};

gdjs.cps_32sceneCode.func = function(runtimeScene) {
runtimeScene.getOnceTriggers().startNewFrame();

gdjs.cps_32sceneCode.GDtxt_9595cpsObjects1.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595cpsObjects3.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595funtooObjects1.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595funtooObjects2.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595funtooObjects3.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595tipObjects1.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595tipObjects2.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595tipObjects3.length = 0;
gdjs.cps_32sceneCode.GDbtn_9595sndObjects1.length = 0;
gdjs.cps_32sceneCode.GDbtn_9595sndObjects2.length = 0;
gdjs.cps_32sceneCode.GDbtn_9595sndObjects3.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595sndObjects1.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595sndObjects2.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595sndObjects3.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects1.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects2.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects3.length = 0;

gdjs.cps_32sceneCode.eventsList2(runtimeScene);
gdjs.cps_32sceneCode.GDtxt_9595cpsObjects1.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595cpsObjects2.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595cpsObjects3.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595funtooObjects1.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595funtooObjects2.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595funtooObjects3.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595tipObjects1.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595tipObjects2.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595tipObjects3.length = 0;
gdjs.cps_32sceneCode.GDbtn_9595sndObjects1.length = 0;
gdjs.cps_32sceneCode.GDbtn_9595sndObjects2.length = 0;
gdjs.cps_32sceneCode.GDbtn_9595sndObjects3.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595sndObjects1.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595sndObjects2.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595sndObjects3.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects1.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects2.length = 0;
gdjs.cps_32sceneCode.GDtxt_9595controllerncObjects3.length = 0;


return;

}

gdjs['cps_32sceneCode'] = gdjs.cps_32sceneCode;
