chrome.runtime.onMessage.addListener((params, sender, sendResponse) => {
  if(params.aim === "popup: fill") {
    fill(params.info, params.map);
  }
  sendResponse("(content script)I finished my task! Ah ha ha ha!");
})

function fill(info, map) {
  const inputs = document.getElementsByTagName("input");
  for(let i = 0; i < inputs.length; ++i) {
    for(let key in info) {
      if(check(key, inputs[i], map)) {
          inputs[i].value = info[key];
          break;
        }
    }
  }
}

function check(key, input, map) {
  if(input.id !== '' && input.id === key) return true;
  if(input.name !== '' && input.name === key) return true;
  if(input.autocomplete !== '' && input.autocomplete === key) return true;
  if(input.type !== '' && input.type === key) return true;
  if(input.placeholder !== '')
    if(input.placeholder.indexOf(key) !== -1 || input.placeholder.indexOf(map[key]) !== -1) return true;
  return false;
}
