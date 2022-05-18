
window.onload = pageLoad;

function pageLoad(){
    document.getElementById("code-apply-button").onclick = getCode;
    document.getElementById("checkout-button").onclick = checkout;
    document.getElementById("signUpOrLogout").onclick = function() { clearCartItem("logOut"); }
    document.getElementById("loginOrWelcome").onclick = function() { clearCartItem("login"); }
    checkLogin();
    readItemsCart();
    // addButtonListener();
}

function getCode(){
    var code = document.getElementById("code-input").value;
    document.getElementById("code-input").value = "";
    document.getElementById("error-msg").innerText = "";
    applyCode(code);
}

async function checkout(){
    let response = await fetch("/checkLoginStatus");
    let isLoginSuccess = await response.json();
    if (isLoginSuccess["result"])
    {
        let response = await fetch("/removeAllCartItem");
        let data = await response.json();
        alert('Checkout Successful');
        showCartItems(data);
        removeCode();
    }
    else if(!isLoginSuccess["result"])
    {
        alert('Please Login');
        clearCartItem("login");
        window.location.href = "Login.html";
    }
}

async function readItemsCart(){
    let response = await fetch("/readItemsCart");
    let data = await response.json();
    showCartItems(data);
    // updateItemAmount();
}

function showCartItems(data){
    var allItemsTotalPrice = 0;
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
        var totalPrice = itemQuantity * itemPrice;
        allItemsTotalPrice = allItemsTotalPrice + totalPrice;

        var cartRow = document.createElement("tr");
        cartRow.classList.add("cart-row");
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
                <input class="cart-quantity-input" type="number" value="${itemQuantity}" min="1">
                <button class="plus-button" type="button">+</button>
            </td>
            <td class="cart-price">${totalPrice} THB</td>`;
        cartRow.innerHTML = cartRowContents;
        cartTable.append(cartRow);
    }

    showItemAmount(keys.length);
    showAllProductPrice(allItemsTotalPrice);
    addButtonListener();
    addInputOnChangeListener();
    addIncrementButtonListener();
    addDecrementButtonListener();
}

function showAllProductPrice(price){
    var itemsCostElement = document.getElementsByClassName("items-cost")[0];
    itemsCostElement.innerText = price + " THB";
    var priceWithDiscountElement = document.getElementsByClassName("total-cost-value")[0];
    priceWithDiscountElement.innerText = price + " THB";
}

function showItemAmount(amount){
    var itemsCountElement = document.getElementsByClassName("items-count")[0];
    var itemsAmountElement = document.getElementsByClassName("items-amount")[0];

    if(amount <= 1)
    {
        itemsCountElement.innerText = amount + " Item";
        itemsAmountElement.innerText = "Item " + amount;
    }
    else
    {
        itemsCountElement.innerText = amount + " Items";
        itemsAmountElement.innerText = "Items " + amount;
    }
}

function addButtonListener(){
    var removeCartItemButtons = document.getElementsByClassName("items-remove-button");
    for(var buttonIndex = 0; buttonIndex < removeCartItemButtons.length; buttonIndex++)
    {
        var button = removeCartItemButtons[buttonIndex];
        button.addEventListener('click', checkCartItemName);
    }
}

function checkCartItemName(event){
    var buttonClicked = event.target;
    var itemNameToRemove = buttonClicked.parentElement.getElementsByClassName("product-name")[0].innerText;
    console.log(itemNameToRemove);
    removeCartItem(itemNameToRemove);
    // addButtonListener();
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
    // updateItemAmount();
}

function addIncrementButtonListener(){
    var incrementButtons = document.getElementsByClassName('plus-button');

    for(var plusButtonIndex = 0; plusButtonIndex < incrementButtons.length; plusButtonIndex++)
    {
        var incrementButton = incrementButtons[plusButtonIndex];
        incrementButton.addEventListener('click',increaseValue);
    }
}

function addDecrementButtonListener(){
    var decrementButtons = document.getElementsByClassName('minus-button');

    for(var minusButtonIndex = 0; minusButtonIndex < decrementButtons.length; minusButtonIndex++)
    {
        var decrementButton = decrementButtons[minusButtonIndex];
        decrementButton.addEventListener('click',decreaseValue);
    }
}

function increaseValue(event){
    var buttonClicked = event.target;
    var itemName = buttonClicked.parentElement.parentElement.getElementsByClassName("product-name")[0].innerText;
    var input = buttonClicked.parentElement.getElementsByClassName("cart-quantity-input")[0];
    var inputValue = input.value;
    var newValue = parseInt(inputValue) + 1;
    input.value = newValue;
    updateCartQuantity(itemName, newValue);
}

function decreaseValue(event){
    var buttonClicked = event.target;
    var itemName = buttonClicked.parentElement.parentElement.getElementsByClassName("product-name")[0].innerText;
    var input = buttonClicked.parentElement.getElementsByClassName("cart-quantity-input")[0];
    var inputValue = input.value;
    var newValue = parseInt(inputValue) - 1;

    if(newValue >= 1){
        input.value = newValue;
        updateCartQuantity(itemName, newValue);
    }
    else{
        input.value = 1;
    }
}

function addInputOnChangeListener(){
    var quantityInputs = document.getElementsByClassName("cart-quantity-input");

    for(var inputIndex = 0; inputIndex < quantityInputs.length; inputIndex++)
    {
        var quantityInput = quantityInputs[inputIndex];
        quantityInput.addEventListener("change",quantityChange);
    }
}

function quantityChange(event){
    var inputChanged = event.target;
    var itemName = inputChanged.parentElement.parentElement.getElementsByClassName("product-name")[0].innerText;
    var itemAmount = inputChanged.value;
    
    if(itemAmount < 1)
    {
        itemAmount = 1;
    }

    updateCartQuantity(itemName,itemAmount);
}

async function updateCartQuantity(name,value){
    let response = await fetch("/updateQuantity", {
        method:"POST",
        headers:{
            'Accept': 'application/json',
			'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            itemName:name,
            amount:value
        })
    });

    let cartData = await response.json();
    console.log(cartData);
    showCartItems(cartData)
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

    let textMsg = await response.text();
    console.log(textMsg)

    if(textMsg == "Invalid code")
    {
        ShowErrorMessage(textMsg);
    }
    else
    {
        ShowDiscountCode(code,textMsg);
        document.getElementById("code-apply-button").disabled = true;
        addCodeRemoveButtonOnClick();
        showPriceWithDiscount(textMsg);
    }
}

function ShowErrorMessage(msg){
    document.getElementById("error-msg").innerText = msg;
}

function ShowDiscountCode(codeName, msg){
    var codeContainer = document.getElementById("code-container");
    var codeRow = document.createElement("div");
    codeRow.classList.add("promo-code-container");
    var codeRowContents = `
        <div>
            <span class="promo-code">${codeName}</span>
            <button id="remove-code-button" class="remove-button" type="button">remove</button>
        </div>
        <div class="discount-value">${msg} THB</div>`;
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

function checkCartItemName(event){
    var buttonClicked = event.target;
    var itemNameToRemove = buttonClicked.parentElement.getElementsByClassName("product-name")[0].innerText;
    console.log(itemNameToRemove);
    removeCartItem(itemNameToRemove);
    // addButtonListener();
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
    // updateItemAmount();
}

function addCodeRemoveButtonOnClick(){
    document.getElementById("remove-code-button").onclick = removeCode;
}

function removeCode(){
    if(document.getElementsByClassName("promo-code-container")[0])
    {
        var codeContainer = document.getElementsByClassName("promo-code-container")[0];
        codeContainer.remove();
    }
    showPriceNoDiscount();
    document.getElementById("code-apply-button").disabled = false;
}

function showPriceWithDiscount(discount){
    var itemsCostElement = document.getElementsByClassName("items-cost")[0];
    var price = parseFloat(itemsCostElement.innerText.replace(' THB',''));
    
    var priceWithDiscount = price - discount;
    var priceWithDiscountElement = document.getElementsByClassName("total-cost-value")[0];
    priceWithDiscountElement.innerText = priceWithDiscount + ' THB';
}

function showPriceNoDiscount(){
    var itemsCostElement = document.getElementsByClassName("items-cost")[0];
    var priceWithDiscountElement = document.getElementsByClassName("total-cost-value")[0];
    var itemsCostText = itemsCostElement.innerText;
    priceWithDiscountElement.innerText = itemsCostText;
}

async function checkLogin(){
    let response = await fetch("/checkLoginStatus");
    let isLoginSuccess = await response.json();
    if (isLoginSuccess["result"])
    {
        var loginHeader = document.getElementById("loginOrWelcome");
        loginHeader.innerHTML = "WELCOME";
        loginHeader.style.color = "white";
        var signUpHeader = document.getElementById("signUpOrLogout");
        signUpHeader.innerHTML = "LOGOUT";
    }
    
    else if (!isLoginSuccess["result"])
    {
        var loginHeader = document.getElementById("loginOrWelcome");
        loginHeader.innerHTML = "LOGIN";
        loginHeader.style.color = "#FFE6A3";
        var signUpHeader = document.getElementById("signUpOrLogout");
        signUpHeader.innerHTML = "SIGN UP";
    }
       
}

async function clearCartItem(action){
    let response = await fetch("/checkLoginStatus");
    let isLoginSuccess = await response.text();

    switch(action)
    {
        case"logOut":
        {
            if (isLoginSuccess == "true")
            {
                let deleteCart = await fetch("/removeAllCartItem");
                countItemInCart();
            }
            
            else if (isLoginSuccess == "false")
            {
                return;
            }   
        }
        break;

        case "login":
        {
            if (isLoginSuccess == "true")
            {
                return;
            }
            
            else if (isLoginSuccess == "false")
            {
                let deleteCart = await fetch("/removeAllCartItem");;
                countItemInCart();
            }   
        }
    }  
}
// function removeCartItem(event){
//     var buttonClicked = event.target;
//     buttonClicked.parentElement.parentElement.parentElement.parentElement.remove();
// }

// async function updateItemAmount(){
//     let response = await fetch("/updateItemAmount");
//     let data = await response.text();
//     updateItemAmountText(data);
// }

// function updateItemAmountText(amount){
//     var itemAmount = parseInt(amount);
//     if(itemAmount <= 1)
//     {
//         document.getElementsByClassName("items-count")[0].innerText = itemAmount + " Item";
//         document.getElementsByClassName("items-amount")[0].innerText = "Item" + itemAmount;
//     }
//     else
//     {
//         document.getElementsByClassName("items-count")[0].innerText = amount + " Items";
//         document.getElementsByClassName("items-amount")[0].innerText = "Items" + itemAmount;
//     }
// }

// function updateCartPrice(){

// }

// function updateCartItemsTotal(){
//     var cartRows = document.getElementsByClassName("cart-row");
//     for(var cartRowIndex = 0; cartRowIndex < cartRows.length; cartRowIndex++)
//     {
//         var cartRow = cartRows[cartRowIndex];
//         var priceElement = cartRow.getElementsByClassName("cart-price")[0];
//         var quantityElement = cartRow.getElementsByClassName("cart-quantity-input")[0];
//         var price = parseFloat(priceElement.innerText.replace(' THB',''));
//         var quantity = quantityElement.value;
//         var total = price * quantity;
//         priceElement.innerText = total + ' THB';
//     }
// }

// function updateCartTotal(){
//     var cartRows = document.getElementsByClassName("cart-row");
//     var total = 0;
//     for(var rowIndex = 0; rowIndex < cartRows.length; rowIndex++)
//     {
//         var cartRow = cartRows[rowIndex];
//         var priceElement = cartRow.getElementsByClassName("cart-price")[0];
//         var quantityElement = cartRow.getElementsByClassName("cart-quantity-input")[0];
//         var price = parseFloat(priceElement.innerText.replace(' THB',''));
//         var quantity = quantityElement.value;
//         total = total + (price * quantity);
//     }

//     var itemsCostElement = document.getElementsByClassName("items-cost")[0];
//     itemsCostElement.innerText = total + ' THB';

//     if(document.getElementsByClassName("promo-code-container")[0])
//     {
//         var discountElement = document.getElementsByClassName("discount-value")[0];
//         discount = parseFloat(discountElement.innerText.replace(' THB',''));
//         total = total - discount;
//     }
//     document.getElementsByClassName("total-cost-value")[0].innerText = total + ' THB';
// }