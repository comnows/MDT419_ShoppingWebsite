window.onload = pageLoad;

function pageLoad(){
    var xhr = new XMLHttpRequest(); 
    xhr.open("GET", "database/item.json"); 
    xhr.onload = function() { 
        var jsondata = JSON.parse(xhr.responseText);
        document.getElementById('coinsCategoryPC').onclick = getCoinsDataPC(jsondata);
        document.getElementById('pointsCategoryPC').onclick = getPointsDataPC(jsondata);
        // document.getElementById('coinsCategoryXbox').onclick = getCoinsDataXbox;
        // document.getElementById('pointsCategoryXbox').onclick = getPointsDataXbox;
        // document.getElementById('coinsCategoryPS').onclick = getCoinsDataPS;
        // document.getElementById('pointsCategoryPS').onclick = getPointsDataPS;
    }; 
    xhr.onerror = function() { 
        alert("ERROR!"); 
    }; 
    xhr.send();
}

function getCoinsDataPC(data){
    var keys = Object.keys(data);
    var pcItem = document.getElementsByClassName("pcItemImg");
    for(var i = 0; i < 4; i++)
    {   
        pcItem[i].src = "pic/home/card_item/PC_Coins/" + data[keys[i]].pic;
    }
}

function getPointsDataPC(data){
    var keys = Object.keys(data);
    var pcItem = document.getElementsByClassName("pcItemImg");
    for(var i = 4; i < 8; i++)
    {
        pcItem[i-4].src = "pic/home/card_item/PC_Points/" + data[keys[i]].pic;
    }
}