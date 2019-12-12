'use babel';

import ImageUploaderSmView from './image-uploader-sm-view';
import { CompositeDisposable } from 'atom';

export default {

  imageUploaderSmView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.imageUploaderSmView = new ImageUploaderSmView(state.imageUploaderSmViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.imageUploaderSmView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'image-uploader-sm:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.imageUploaderSmView.destroy();
  },

  serialize() {
    return {
      imageUploaderSmViewState: this.imageUploaderSmView.serialize()
    };
  },

  toggle() {
    let clipboard = require('electron').clipboard
  let editor = atom.workspace.getActiveTextEditor()
if (editor.getPath().substr(-3) !== '.md') {console.log("not a md file");return}
console.log('TestImg was toggled!');

var fs = require("fs");
var request = require("request");

let tempFilePath = null
let removeFile = () => tempFilePath && fs.unlinkSync(tempFilePath)
try {
  if (clipboard.readImage().isEmpty()) return // not image
  //if is image the start to upload
  //first insert text to md
  let placeHolderText = `uploading...`
  // add placeholder
  editor.insertText(`![](${placeHolderText})`, editor)
  let suffix = clipboard.readText().replace(/(.*)+(?=\.)/, '')

  // electron clipboard can not supports gifs
  let buffer = null
  switch (suffix) {
    case '.jpg':
    case '.jpeg':
      buffer = clipboard.readImage().toJpeg(100)
      break
    case '.png':
    default:
      buffer = clipboard.readImage().toPNG()
  }
  let randomFileName = (Math.random() * 1e6 | 0).toString(32) + (suffix || '.png')
  tempFilePath = __dirname+randomFileName

  fs.writeFileSync(tempFilePath, Buffer.from(buffer))

const path = tempFilePath
const formData = {
smfile : fs.createReadStream(path),
};
var options = { method: 'POST',
url: 'https://sm.ms/api/v2/upload',
headers:
{ 'cache-control': 'no-cache',
 Connection: 'keep-alive',
 Host: 'sm.ms',
 'Cache-Control': 'no-cache',
 Accept: '*/*',
  'User-Agent': 'PostmanRuntime/7.20.1',
},
formData:
formData };

console.log("start")
request(options, function (error, response, body) {
console.log("finish")
if (error) throw new Error(error);
console.log(body);
if(JSON.parse(body).success==true){
const imgUrl = JSON.parse(body).data.url
console.log(imgUrl);
editor.scan(new RegExp(placeHolderText), tools => tools.replace(imgUrl))
}else if(JSON.parse(body).success==false){
  editor.scan(new RegExp(placeHolderText), tools => tools.replace(JSON.parse(body).message))
}else {
editor.scan(new RegExp(placeHolderText), tools => tools.replace("upload error"))
}


//editor.insertText(`![](${imgUrl})`, editor)
});
}catch(e){
console.error(e)
editor.scan(new RegExp(placeHolderText), tools => tools.replace("upload error"))
}
  }

};
