exports.getInfo = function() {
  return  {
    authors: [
      {
        name: "Thomas Warnez"
      },
      {
        name: "Carl Goegebeur"
      }
    ]
  };
};


exports.getCommand = function(){
  return {
    previousCommand: [
      {command:"start"}
    ]
  };
};
