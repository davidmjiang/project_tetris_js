"use strict";

var COLORS = ["green", "blue", "DarkKhaki", "red", "magenta", "MediumAquaMarine"]

var  POINTS_PER_ROW = 10;

function Block (x, y) {
  this.xPos = x;
  this.yPos = y;
  this.move = function(direction) {
      this.xPos += direction;
  }
}

var create_square = function(){
  return [new Block(0, 20), new Block(1,20), new Block(1, 21), new Block(0, 21)];
};

var create_4_1 = function(){
  return [new Block(0, 20), new Block(0, 21), new Block(0, 22), new Block(0,23)];
};

var create_l_shape_right = function(){
  return [new Block(0, 21), new Block(1, 21), new Block(2, 21), new Block (2,20)];
};

var create_l_shape_left = function(){
  return [new Block(0, 20), new Block(0, 21), new Block(1, 21), new Block(2, 21)];
};

var create_s_shape_left = function(){
  return [new Block(0, 20), new Block(1, 20), new Block(1, 21), new Block(2, 21)];
};

var create_s_shape_right = function(){
  return [new Block(0, 21), new Block(1, 21), new Block(1, 20), new Block(2, 20)];
};

//pieces start on the left
var PIECE_TYPES = {
  square: create_square,
  //this is a vertical 
  "4x1": create_4_1,
  l_shape_right: create_l_shape_right,
  l_shape_left: create_l_shape_left,
  s_shape_left: create_s_shape_left,
  s_shape_right: create_s_shape_right
};


var randomPiece = function(){
  var key_arr = Object.keys(PIECE_TYPES);
  return key_arr[Math.floor(Math.random()*key_arr.length)];
};

function Piece(){
  this.shape = randomPiece();
  this.body = PIECE_TYPES[this.shape]();
  this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  this.shiftTo = function(shift){
    for(var i = 0; i < this.body.length; i++){
      this.body[i].move(shift);
    }
  };
  this.removeBlock = function(x,y){
    this.body = this.body.filter(function(block){
      return !(block.xPos === x && block.yPos === y);
    })
  };
}

var GRID_HEIGHT = 24;
var GRID_WIDTH = 10;

var model = {

  init: function() {
    this.createGrid();
    this.currentPiece = this.createPiece();
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

  createPiece: function() {
    var piece = new Piece();
    //move the piece to a random starting X-position
    this.randomizeX(piece)
    //add the piece to the grid
    this.addToGrid(piece);
    return piece;
  },

  randomizeX: function(piece){
    //get random x depending on the shape of the piece
    var multiplier;
    switch(piece.shape){
      case "square":
        multiplier = GRID_WIDTH - 1;
        break;
      case "4x1": 
        multiplier = GRID_WIDTH;
        break;
      default:
        multiplier = GRID_WIDTH - 3;
    }
    var starting_point = Math.floor(Math.random()*multiplier);
    piece.shiftTo(starting_point);
  },

  addToGrid: function(piece){
    //iterate through body of the piece and add a reference to the piece to the grid at each spot
    for(var i = 0; i < piece.body.length; i++){
      var currentBlock = piece.body[i];
      this.grid[currentBlock.xPos][currentBlock.yPos] = piece;
    } 
  },

  tic: function(){
    //before moving, check if there is a block below the current block. if there is, replace the block
    if(this.hitABlock()){
      this.replaceBlock();
    }
    //if not, move the block
    else{
      this.dropBlock();
      //after moving, check if the block has hit bottom. if so, replace the blocks
      if (this.hitBottom()){
        this.replaceBlock();
      }
      this.deleteFullRows();
    }
  },

  hitABlock: function(piece){
    var p = piece || this.currentPiece;
    //loop through each block of the current piece to check if it has hit another block not on the current piece
    for(var i = 0; i < p.body.length; i++){
      var currentBlock = p.body[i];
      var blockBelow = this.grid[currentBlock.xPos][currentBlock.yPos-1];
      if(blockBelow && blockBelow!==p){
        return true;
      }
    }
    return false;
  },

  hitBottom: function(piece){
    var p = piece || this.currentPiece;
    //loop through each block of the current piece to check if it has hit the ground
    for(var i = 0; i < p.body.length; i++){
      var currentBlock = p.body[i];
      if(currentBlock.yPos === 0){
        return true;
      }
    }
    return false;
  },

  replaceBlock: function(){
    this.currentPiece = this.createPiece();
  },

  dropBlock: function(piece){
    //iterate through all the blocks in the piece, empty its current location, and decrease the y by 1. After all blocks have changed, add the new piece to the grid
    var p = piece || this.currentPiece;
    for(var i = 0; i < p.body.length; i++){
      var currentBlock = p.body[i];
      this.grid[currentBlock.xPos][currentBlock.yPos] = null;
      currentBlock.yPos -= 1;
    }
    this.addToGrid(p);
  },

  deleteFullRows: function() {
    for(var i = 0; i < GRID_HEIGHT; i++) {
      var blocks = 0;
      for(var j = 0; j < GRID_WIDTH; j++) {
        if (!this.grid[j][i]) {
           break;
        }  
        else{
          blocks ++;
        }
      }
      if(blocks === 10){
        this.deleteRow(i);
      }
    }
  },

  deleteRow: function(rowIndex) {
    for(var j = 0; j < GRID_WIDTH; j++) {
      //delete block object
      this.deleteBlock(j, rowIndex);
      //clear grid
      this.grid[j][rowIndex] = null;
    }
    //move every block down by 1
    this.lowerBlocksAbove(rowIndex);
    controller.userScore += POINTS_PER_ROW;
  },

  deleteBlock: function(x, y){
    var piece = this.grid[x][y];
    piece.removeBlock(x,y); 
  },
  
  lowerBlocksAbove: function(row){
    //find all blocks above row and lower until they hit a block or hit bottom
    var pieces_moved = [];
    for(var y = row; y < GRID_HEIGHT; y++){
      for(var x = 0; x < GRDID_WIDTH; x++){
        var cell = this.grid[x][y];
        if(cell){
          pieces_moved.push(cell);
          this.doGravity(cell);
        }
      }
    }
  },

  doGravity: function(piece){
    while(!(this.hitBottom() || this.hitABlock())){
      this.dropBlock(piece);
    }
  },

  placeBlock: function(piece) {
    var p = piece || this.currentPiece;
    while(this.currentPiece === p) {
      this.tic();
    }
  },

  moveBlock: function(direction){
    //if its a valid move, move every piece of the block
    if(this.moveValid(direction)){
      this.moveSideways(direction);
    }
  },

  moveSideways: function(direction){
    var p = this.currentPiece;
    for(var i = 0; i < p.body.length; i++){
      var currentBlock = p.body[i];
      this.grid[currentBlock.xPos][currentBlock.yPos] = null;
      currentBlock.xPos += direction;
    }
    this.addToGrid(p);
  },

  moveValid: function(direction){
    //then check if there is a wall in the way
    for(var i = 0; i < this.currentPiece.body.length; i++){
      var currentBlock = this.currentPiece.body[i];
      if(currentBlock.xPos === 0 && direction === -1){
        return false;
      }
      else if(currentBlock.xPos === GRID_WIDTH-1 && direction === 1){
        return false;
      }
    }
    //check if there is a block in the way
    if(this.sideIntoBlock(direction)){
      return false;
    }
    return true;
  },

  sideIntoBlock: function(direction){
    var p = this.currentPiece;
    //loop through each block of the current piece to check if it has hit another block not on the current piece
    for(var i = 0; i < p.body.length; i++){
      var currentBlock = p.body[i];
      var sideBlock = this.grid[currentBlock.xPos + direction][currentBlock.yPos];
      if(sideBlock && sideBlock!==p){
        return true;
      }
    }
    return false;
  },

  checkLine20: function() {
    for(var i = 0; i < GRID_WIDTH; i++) {
      if (this.grid[i][20] && this.hitABlock(this.grid[i][20])) {
        return true;
      }
    }
    return false;
  }


};