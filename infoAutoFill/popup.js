{

  /*---------------------Advanced Select---------------------*/

  if(document.getElementsByClassName("pj-advanced-select-wrapper").length !== 0) {
    
    const advancedSelectContainers = document.getElementsByClassName("pj-advanced-select-container");
    // const main = advancedSelectContainer.firstElementChild;
    let options = advancedSelectContainers[0].lastElementChild;
    options = [options];
    for(let i = 1; i < advancedSelectContainers.length; ++i) {
      options.push(advancedSelectContainers[i].lastElementChild);
    }
    const advancedSelectInputs = document.getElementsByClassName("pj-advanced-select-input");
    const advancedSelectSpans = document.getElementsByClassName("pj-advanced-select-span");
    
    let images = advancedSelectSpans[0].getElementsByTagName("img");
    images = Array.prototype.slice.call(images);

    for(let i = 1; i < advancedSelectSpans.length; ++i) {
      images = images.concat(Array.prototype.slice.call(advancedSelectSpans[i].getElementsByTagName("img")));
    }
    
    for(let i = 0; i < advancedSelectSpans.length; ++i) {
      // advancedSelectSpans[i].onclick = turnOnOff(i);   //It's wrong! 'turnONOff' was executed!
      advancedSelectSpans[i].onclick = function (){
        turnOnOff(i);
      }
    }
      

    function turnOnOff(idx){
      toggleClass(images[idx * 2], "pj-hide");
      toggleClass(images[idx * 2 + 1], "pj-hide");
      toggleClass(options[idx], "pj-hide");
    }

    for(let i = 0; i < options.length; ++i) {
      options[i].onclick = function (e){
        e = e || window.event;
        if(e.target.className === "text") {
          advancedSelectInputs[i].value = e.target.innerText;
          turnOnOff(i);
        }
        if(e.target.parentElement.className === "image") {
          let key = e.target.parentElement.parentElement.parentElement.previousElementSibling.firstElementChild.id;
          let value = e.target.parentElement.parentElement.firstElementChild.innerText;
          
          getSingleHistory('fillHistory', function (fillHistory){
            if(fillHistory[key] !== undefined) {
              let ans = [];
              for(let i = 0; i < fillHistory[key].length; ++i) {
                if(fillHistory[key][i] !== value) ans.push(fillHistory[key][i]);
              }
              fillHistory[key] = ans;
              setSingleHistory('fillHistory', fillHistory, (args) => {
                console.log(args);
              }, fillHistory);
            }
            // e.target.parentElement.parentElement.remove();
            addClass(e.target.parentElement.parentElement, "pj-hide");
            removeClass(e.target.parentElement.parentElement, "option");
          }, function (){
            console.log("FirstTime!");
          })

        }
      }
    }

    document.body.onclick = function (e){
      e = e || window.event;
      for(let j = 0; j < advancedSelectContainers.length; ++j) {
        if(!advancedSelectContainers[j].contains(e.target)) {
          removeClass(images[j * 2], "pj-hide");
          addClass(images[j * 2 + 1], "pj-hide");
          addClass(options[j], "pj-hide");
        }
      }  
    }
  }

  function addClass(obj, cn) {
    if(!hasClass(obj, cn))
      obj.className += " " + cn;
  }
  
  function hasClass(obj, cn) {
    let reg = new RegExp("\\b" + cn + "\\b");
    return reg.test(obj.className);
  }
  
  function removeClass(obj, cn) {
    let reg = new RegExp("\\b" + cn + "\\b");
    obj.className = obj.className.replace(reg, "");
  }
  
  function toggleClass(obj, cn) {
    if(hasClass(obj, cn))
      removeClass(obj, cn);
    else
      addClass(obj, cn);
  }

  /*---------------------Advanced Select---------------------*/

  //fillHistory + fLastTime
  getSingleHistory('fLastTime', function (fLastTime){
    for(let key in map) {
      let input = document.getElementById(key);
      if(input != null) input.value = fLastTime[key];
    }
  }, function (){
    console.log('FirstTime!');
  })

  getSingleHistory('fillHistory', function (fillHistory){
    for(let key in map) {
      let input = document.getElementById(key);
      if(input != null) {
        let ul = input.parentElement.nextElementSibling;
        for(let i = 0; i < fillHistory[key].length; ++i) {
          let li = document.createElement("li");
          li.setAttribute("class", "option");
          li.innerHTML = `<div class="text">
                            ${fillHistory[key][i]}
                          </div>
                          <div class="image">
                            <img src="close.svg" alt="关闭">
                          </div>`;
          ul.appendChild(li);
        }
      }
    }
  }, function (){
    console.log("FirstTime!");
  })


  const pwd = document.getElementById("pwd");
  if(pwd) {
    pwd.onclick = function (){
      const password = document.getElementById("password");
      if(password) {
        password.type = password.type === "text" ? "password" : "text";
      }
    }
  }

  const btn = document.getElementById("do");
  btn.onclick = function (){
    let info = collectInfo();
    callContentScript({aim: "popup: fill", info, map}, function(response){
      console.log(response);

      getSingleHistory('fillHistory', function (fillHistory){
        console.log("get fillHistory succeed!");
        modifyHistory(fillHistory, info);
      }, function (){
        console.log("First set history!");
        firstSetHistory(info);
      });
    })
  }

  function collectInfo(){
    let info = {};
    for(let key in map) {
      let obj = document.getElementById(key);
      if(obj != null) info[key] = obj.value;
    }
    return info;
  }

  const map = {
    telephone: "手机",
    email: "邮箱",
    username: "用户名",
    loginId: "身份证号",
    password: "密码"
  };

  function firstSetHistory(info){
    let ans = {};
    for(let key in info) {
      ans[key] = [];
      ans[key].push(info[key]);
    }
    setSingleHistory('fillHistory', ans, (args) => {
      console.log(args);
      setSingleHistory('fLastTime', info, (args) => {
        console.log(args);
      }, info);
    }, ans);
  }

  function modifyHistory(fillHistory, info){
    for(let key in fillHistory) {
      let unique = true;
      for(let i = 0; i < fillHistory[key].length; ++i) {
        if(fillHistory[key][i] === info[key]) {
          unique = false;
          break;
        }
      }
      if(unique) fillHistory[key].push(info[key]);
    }
    setSingleHistory('fillHistory', fillHistory, (args) => {
      console.log(args);
      setSingleHistory('fLastTime', info, (args) => {
        console.log(args);
      }, info);
    }, fillHistory);
  }

}


function callContentScript(params, callback) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, params, res => {
      callback && callback(res);
    })
  });
}

function getSingleHistory(key, callback, emptyCallback) {
  chrome.storage.sync.get([key], function(result) {
    if(JSON.stringify(result) !== "{}" && result[key] !== undefined) {
      callback(result[key]);
    } else {
      emptyCallback();
    }
  });
}

function setSingleHistory(key, value, callback, args){
  chrome.storage.sync.set({[key]: value}, callback && callback(args));
}