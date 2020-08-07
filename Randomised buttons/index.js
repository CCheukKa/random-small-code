var buttons=['A','B','X','Y','up','down','left','right','L','ZL','R','ZR','L-stick','R-stick','+','-','capture'];
var original=['A','B','X','Y','up','down','left','right','L','ZL','R','ZR','L-stick','R-stick','+','-','capture'];
var shuffled=[];

var count = buttons.length.valueOf();

var index;

for (let i = 0; i < count; i++) {

    index = buttons[Math.floor(Math.random() * buttons.length.valueOf())];

    while(index == original[i]){
        index = buttons[Math.floor(Math.random() * buttons.length.valueOf())];
    }

    shuffled.push( buttons.splice( buttons.indexOf(index) , 1) );
}

console.log(shuffled);