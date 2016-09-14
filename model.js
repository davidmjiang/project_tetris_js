"use strict";

var COLORS = ["green", "blue", "DarkKhaki", "red", "magenta", "MediumAquaMarine"]


function Block (x, y) {
  this.xPos = x;
  this.yPos = y;
  this.move = function(direction) {
      this.xPos += direction;
  }
  this.color = COLORS[Math.floor(Math.random() * COLORS.length)]
}

var GRID_HEIGHT = 24;
var GRID_WIDTH = 10;

var model = {

  init: function() {
    this.createGrid();
    this.currentBlock = this.createBlock();
  },
  grid: [],

  createGrid: function() {
    for(var i = 0; i < GRID_WIDTH; i++) {
      var column = [];
      for(var j = 0; j < GRID_HEIGHT; j++) {
        column[j] = null;
      }
      this.grid[i] = column;
    }
  },

  dropBlock: function(){
    this.grid[this.currentBlock.xPos][this.currentBlock.yPos] = null;
    this.currentBlock.yPos -= 1;
    this.addToGrid(this.currentBlock);
    if (this.checkForDeath()){
      this.replaceBlock();
    }
  },

  checkForDeath: function(block){
    var b = block || this.currentBlock;
    return b.yPos === 0 || this.hitABlock(); 
  },

  hitABlock: function(){

  },

  replaceBlock: function(){
    this.currentBlock = this.createBlock();
  },

  createBlock: function() {
    //start block at random X and first hidden row 
    var block = new Block(this.randomX(), 20);
     this.addToGrid(block);
    return block;
  },

  addToGrid: function(block){
    this.grid[block.xPos][block.yPos] = block;
  },

  randomX: function(){
    return Math.floor(Math.random()*GRID_WIDTH);
  },

  placeBlock: function() {
    var b = this.currentBlock;
    while(!this.checkForDeath(b)) {
      this.dropBlock();
    }
  },

  moveBlock: function(direction){
    if(this.blockMoveValid(direction)){
      this.grid[this.currentBlock.xPos][this.currentBlock.yPos] = null;
      this.currentBlock.move(direction);
      this.addToGrid(this.currentBlock);
    }
  },

  blockMoveValid: function(direction){
    var x = this.currentBlock.xPos;
    if(x === 0 && direction === -1){
      return false;
    }
    else if(x === GRID_WIDTH-1 && direction === 1){
      return false;
    }
    else{
      return true;
    }
  }


};