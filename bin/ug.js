#! /usr/bin/env node

'use strict';

var fs = require("fs");
var path = require('path');
var compressor = require('node-minify');

run(process.argv.slice(2));


/**
 * [run ]
 * @param  {[]} opt [ug 待压缩  压缩到路径 ] ex: ug  ./source/  ./dest/
 * @return {[type]}     [description]
 */
function run (opt){
  var src = opt[0] ;
  if(!src || typeof(src) =="undefined"){
    console.log("\r\n请输入需要压缩的文件或文件夹");
    return;
  }
  var dest = opt[1];
  if (dest.indexOf(".")<0 && !fs.existsSync(dest)) {
        console.log("创建文件夹："+dest);
        fs.mkdirSync(dest);
  }
  if(dest.indexOf(".")>=0){
    fs.writeFile(dest,"", function(err) {
        if(err) {
            return console.log(err);
        }
    });
  }


  var compressor = opt[3] || "no-compress";

  // 辨别 src 和 dest  的类别
  try{
    let srcIsDic = fs.statSync(src).isDirectory();
    let destIsDic = fs.statSync(dest).isDirectory();
    if(!srcIsDic){ // 单文件压缩
      if(!destIsDic){
          ugOneFile(src,dest);
      }else{
          ugOneFile(src,path.join(dest,src));
      }

    }else {  //  多文件压缩
      if(destIsDic){
        ugFilesInDic(src,dest);
      }else{
        console.log("多文件压缩的目的地必须是文件夹");
        return;
      }
    }
  }catch(e){
    if(e.code === 'ENOENT'){
      console.log("\r\n没有找到文件夹或文件：\r\n" + e.path);
    }else{
      console.log(e);
    }
  }

}

function ugOneFile(src,dest){
  let type = "";
  if(src.indexOf('.css')>=0){
    type="clean-css";
  }else if(src.indexOf('.js')>=0){
    type="uglifyjs";
  }
    console.log("压缩中："+src+" --->  "+dest);
  compressor.minify({
    compressor: type,
    input: src,
    output: dest,
    callback: function (err, min) {
      if(err){console.log(err);}
    }
  });
}

function ugFilesInDic(src,dest){
  console.log(dest);
  let files=fs.readdirSync(src);
  files.forEach((val,index) => {
      let fPath=path.join(src,val); // 用于分析是否是 文件夹 返回的数据用的是 val
      let stats=fs.statSync(fPath);
      if(stats.isDirectory()){
        var newFolder = path.join(dest,val);
        if (!fs.existsSync(newFolder)) {
              console.log("创建文件夹："+ newFolder);
              fs.mkdirSync(newFolder);
        }
        ugFilesInDic(fPath,path.join(dest,val));
      }
      if(stats.isFile()){
          ugOneFile(fPath,path.join(dest,val));
      }
  });
}
