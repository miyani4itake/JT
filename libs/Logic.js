'use strict'

import data from './master.json'
import data_evaluation from './evaluation.json'

const evaluation = {"Great" : 0, "Good" :1 , "Caution" : 2};


export default class Logic {
  // this.param = [ bloodpressurewObj, triglyceride, hdl, bmi, gtp, bloodsugar ]
  // 【sample】[ {low: 0, heigh: 100}, 10, 1, 10, 3, 10]
  constructor(param = null){
    this.param =  new Array();
    if(param != null) this.param = param;
  }

  evaluate(){
    if( !this.validate() ){
      return false;
    }

    let filename = "";
    let output = {};
    output = {
      movie : ["moviefile.mp3", "moviefile.webm"],
      result : [0, "copy"],
      details : new Array(6)
    };

    // logic_movie
    let totalpoint = 0;
    for (let i in this.param ){
      let obj;
      if( typeof this.param[i] === 'object' ) {
        obj = this.logic1(i,this.param[i]);
      } else {
        obj = this.logic2(i,this.param[i]);
      }
      output.details[i] = obj.detail;
      totalpoint += obj.point;
      filename += String( obj.point);
    }

    // logic_evaluation
    let obj2 = data_evaluation.find( (e, i, a) => {
      if(e.point == totalpoint ) return true;
      return false;
    });

   // 評価アルファベット-点数_各項目の点数6個.mp4
   let index = ~~(Math.random()*3);
   filename = `${obj2.type}-${obj2.point}_${filename}`;

   output.movie = [ `${filename}.mp3`, `${filename}.webm`];
   output.result = [0, obj2.copy[index]];


    return output;
  }

  // パラメータチェック
  validate(){
    for ( let v of this.param ){
      if( typeof v  === 'object' ) {
        if ( typeof v.low  !== 'number' || typeof v.heigh  !== 'number' ) {
            return false;
        }
      } else if ( typeof v !== 'number') {
        return false;
      }
    }
    return true;
  }

  logic1 (i,p) {
    // 血圧用ロジック
    let out = {point : 0 , detail: {evaluation:0, tit:"", text :"", graph : 0}};
    let master = data[i];

    let low = master.lists.find( (e, i, a) => {
      if( e.input_low.min == null ){
        if( e.input_low.max >= p.low ) return true;
      } else if( e.input_low.max == null ){
        if( e.input_low.min <= p.low ) return true;
      } else {
        if( e.input_low.min <= p.low && e.input_low.max >= p.low ) return true;
      }
      return false;
    });

    let heigh = master.lists.find( (e, i, a) => {
      if( e.input_heigh.min == null ){
        if( e.input_heigh.max >= p.heigh ) return true;
      } else if( e.input_heigh.max == null ){
        if( e.input_heigh.min <= p.heigh ) return true;
      } else {
        if( e.input_heigh.min <= p.heigh && e.input_heigh.max >= p.heigh ) return true;
      }
      return false;
    });

    let obj;
    if(low.point == heigh.point ) {
      // 上の方の血圧を取得
      obj = heigh;
    } else if (low.point >  heigh.point ){
      obj = heigh;
    } else {
      obj = low;
    }

    out.detail.evaluation = evaluation[obj.rating];
    out.detail.tit = obj.comment;
    out.detail.graph = obj.graph;
    out.detail.text = master.explanation;
    out.point = obj.point;
    return out;
  }
  
  logic2 (i,p) {
    // 血圧以外のロジック
    let out = {point : 0 , detail: {evaluation:0, tit:"", text :"", graph : 0}};
    let master = data[i];

    let obj  = master.lists.find( (e, i, a) => {
      if( e.input.min == null ){
        if( e.input.max >= p ) return true;
      } else if( e.input.max == null ){
        if( e.input.min <= p ) return true;
      } else {
        if( e.input.min <= p && e.input.max >= p ) return true;
      }
      return false;
    });
    out.detail.evaluation = evaluation[obj.rating];
    out.detail.tit = obj.comment;
    out.detail.graph = obj.graph;
    out.detail.text = master.explanation;
    out.point = obj.point;
    return out;
  }

}
