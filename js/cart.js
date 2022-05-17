window.onload = pageLoad;

function pageLoad(){
    document.getElementById("code-apply-button").onclick = getCode;
    document.getElementById("checkout-button").onclick = checkout;
    addButtonListener();
}

function getCode(){
    var code = document.getElementById("code-input").value;
    document.getElementById("code-input").value = "";
    applyCode(code);
}

function checkout(){

}

async function applyCode(code){
    let response = await fetch("/applyCode", {
        method:"POST",
        headers:{
            'Accept': 'application/json',
			'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            discountCode:code
        })
    });

    let textMsg = response.text();

    if(textMsg == "invalid")
    {

    }
    else
    {

    }
}

function ShowDiscountCode(msg){
    var codeContainer = document.getElementById("code-container");
    var codeRow = document.createElement(div);
    codeRow.classList.add("promo-code-container");
    var codeRowContents = `
        <div>
            <span class="promo-code">FIFA15</span>
            <button id="remove-code-button" class="remove-button" type="button">remove</button>
        </div>
        <div class="discount-value">15 THB</div>`;
    codeRow.innerHTML = codeRowContents;
    codeContainer.append(codeRow);
}

function addButtonListener(){
    var removeCartItemButtons = document.getElementsByClassName("items-remove-button");
    for(var buttonIndex = 0; buttonIndex < removeCartItemButtons.length; buttonIndex++)
    {
        var button = removeCartItemButtons[buttonIndex];
        button.addEventListener('click', checkCartItemName);
    }
}

// function removeCartItem(event){
//     var buttonClicked = event.target;
//     buttonClicked.parentElement.parentElement.parentElement.parentElement.remove();
// }

async function readItemsCart(){
    let response = await fetch("/readItemsCart");
    let data = await response.json();
    showCartItems(data);
}

function checkCartItemName(event){
    var buttonClicked = event.target;
    var itemNameToRemove = buttonClicked.parentElement.getElementsByClassName("product-name")[0].innerText;
    console.log(itemNameToRemove);
}

async function removeCartItem(name){
    let response = await fetch("/removeCartItem", {
        method:"POST",
        headers:{
            'Accept': 'application/json',
			'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            itemName:name
        })
    });

    let itemsCartData = await response.json();
    showCartItems(itemsCartData);
}

function showCartItems(data){
    var keys = Object.keys(data);
    var cartTable = document.getElementById("cart-items-table");
    cartTable.innerHTML = `
        <tr>
            <th>product details</th>
            <th>quantity</th>
            <th>price</th>
        </tr>`;

    for(var i = 0; i < keys.length; i++)
    {
        var itemImage = data[keys[i]]["picPath"];
        var itemName = data[keys[i]]["itemName"];
        var itemQuantity = data[keys[i]]["quantity"];
        var itemPrice = data[keys[i]]["price"];

        var cartRow = document.createElement(tr);
        cartTable = document.getElementById("cart-items-table");
        var cartRowContents = `
            <td>
                <div class="cart-info">
                    <img src="${itemImage}">
                    <div class="product-details">
                        <p class="product-name">${itemName}</p>
                        <button class="items-remove-button" type="button">remove</button>
                    </div>
                </div>
            </td>
            <td>
                <button class="minus-button" type="button">-</button>
                <input type="number" value="${itemQuantity}" min="1">
                <button class="plus-button" type="button">+</button>
            </td>
            <td>${itemPrice} THB</td>`;
        cartRow.innerHTML = cartRowContents;
        cartTable.append(cartRow);
    }
}