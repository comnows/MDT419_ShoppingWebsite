// const { get } = require("express/lib/response");
window.onload = pageLoad;

function pageLoad(){
    document.getElementById('coinsCategoryPC').onclick = function() { readDataJson("pcCoins"); };
    document.getElementById('pointsCategoryPC').onclick = function() { readDataJson("pcPoints"); };
    document.getElementById('coinsCategoryXbox').onclick = function() { readDataJson("xboxCoins"); };
    document.getElementById('pointsCategoryXbox').onclick = function() { readDataJson("xboxPoints"); };
    document.getElementById('coinsCategoryPS').onclick = function() { readDataJson("psCoins"); };
    document.getElementById('pointsCategoryPS').onclick = function() { readDataJson("psPoints"); }
    document.getElementById('addPcItemToCart').onclick = function() { writeItemToCartData("addPcItemToCart","pcItemImg"); };
    document.getElementById('addPcItemToCart2').onclick = function() { writeItemToCartData("addPcItemToCart2","pcItemImg"); };
    document.getElementById('addPcItemToCart3').onclick = function() { writeItemToCartData("addPcItemToCart3","pcItemImg"); };
    document.getElementById('addPcItemToCart4').onclick = function() { writeItemToCartData("addPcItemToCart4","pcItemImg"); };
    document.getElementById('addXboxItemToCart').onclick = function() { writeItemToCartData("addXboxItemToCart","xboxItemImg"); };
    document.getElementById('addXboxItemToCart2').onclick = function() { writeItemToCartData("addXboxItemToCart2","xboxItemImg"); };
    document.getElementById('addXboxItemToCart3').onclick = function() { writeItemToCartData("addXboxItemToCart3","xboxItemImg"); };
    document.getElementById('addXboxItemToCart4').onclick = function() { writeItemToCartData("addXboxItemToCart4","xboxItemImg"); };
    document.getElementById('addPsItemToCart').onclick = function() { writeItemToCartData("addPsItemToCart","psItemImg"); };
    document.getElementById('addPsItemToCart2').onclick = function() { writeItemToCartData("addPsItemToCart2","psItemImg"); };
    document.getElementById('addPsItemToCart3').onclick = function() { writeItemToCartData("addPsItemToCart3","psItemImg"); };
    document.getElementById('addPsItemToCart4').onclick = function() { writeItemToCartData("addPsItemToCart4","psItemImg"); };
}

async function readDataJson(category){
    let response = await fetch("/readItemData");
    let data = await response.json();
    changeCategory(data,category);
}

function changeCategory(itemData,category){
    var keys = Object.keys(itemData);
    switch(category)
    {
        case "pcCoins":
            var pcItem = document.getElementsByClassName("pcItemImg");
            for(var i = 0; i < 4; i++)
            {   
                pcItem[i].src = itemData[keys[i]].picPath;
            }
            break;
        case "pcPoints":
            var pcItem = document.getElementsByClassName("pcItemImg");
            for(var i = 4; i < 8; i++)
            {
                pcItem[i-4].src = itemData[keys[i]].picPath;
            }
            break;
        case "xboxCoins":
            var xboxItem = document.getElementsByClassName("xboxItemImg");
            for(var i = 8; i < 12; i++)
            {
                xboxItem[i-8].src = itemData[keys[i]].picPath;
            }
            break;
        case "xboxPoints":
            var xboxItem = document.getElementsByClassName("xboxItemImg");
            for(var i = 12; i < 16; i++)
            {
                xboxItem[i-12].src = itemData[keys[i]].picPath;
            }
            break;
        case "psCoins":
            var psItem = document.getElementsByClassName("psItemImg");
            for(var i = 16; i < 20; i++)
            {
                psItem[i-16].src = itemData[keys[i]].picPath;
            }
            break;
        case "psPoints":
            var psItem = document.getElementsByClassName("psItemImg");
            for(var i = 20; i < 24; i++)
            {
                psItem[i-20].src = itemData[keys[i]].picPath;
            }
    }
}
async function writeItemToCartData(itemId,itemClass){
        var itemToAddPath = document.getElementById(itemId).getElementsByClassName(itemClass)[0].src;
        console.log(itemToAddPath);
        let response = await fetch("/writeItemData", {
            method: "POST" , 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                itemToAdd: itemToAddPath})
        });        
        let data = await response.json();
        console.log(data);
}