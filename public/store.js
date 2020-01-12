/**we want to make sure that the document is loaded before we attempt to alter anything
 * because if an element doesn't exist and we try to find it something is going to go wrong
 * So we check the state of the document and if it is'loading' we make a listener that once 
 * we are finished loading says ok, run our ready function now
 */
if(document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
}
else {
    ready()
}
/**sets up our page for being interacted with */
function ready() {
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for (var i = 0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i]
        /**addEventListener adds a listener for the specifed type of interaction on the button
         * in this case a click, then we have run our function
        */
        button.addEventListener('click', removeCartItem)
    }

    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-button')
    for(var i = 0; i < addToCartButtons.length; i++){
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }
    var PurchaseButton = document.getElementsByClassName('btn-purchase')[0].addEventListener('click',
    purchaseClicked)


}


var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: 'auto',
    token: function(token) {
        var items = []
        var cartItemContainer = document.getElementsByClassName('cart-items')[0]
        var cartRows = cartItemContainer.getElementsByClassName('cart-row')
        for(var i = 0; i < cartRows.length; i ++){
            var cartRow = cartRows[i]
            var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
            var quantity = quantityElement.value
            var id = cartRow.dataset.itemId
            items.push({
                id: id,
                quantity: quantity
            })
        }

        fetch('/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                items: items
            })
        }).then(function(res){
            return res.json()
        }).then(function(data) {
            alert(data.message)
            var cartItems = document.getElementsByClassName('cart-items')[0]
            while (cartItems.hasChildNodes()) {
                cartItems.removeChild(cartItems.firstChild)
            }
            updateCartTotal()
        }).catch(function(error) {
            console.error(error)
        })
    }
})


function purchaseClicked(event)
{

    var priceElement = document.getElementsByClassName('cart-total-price')[0]
    var price = parseFloat(priceElement.innerText.replace('$', '')) * 100/**expecting cents so * 100 */
    stripeHandler.open({
        amount: price
    })
}


/** set the var to be the specific button clicked using event.target
* then goes 2 divs of parents up, one per parentElement and removes everything held inside 
* including the divs themselves
* then we call the update cart total function
*/
function removeCartItem(event) {
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
}


function quantityChanged(event) {
    var input = event.target
    if(isNaN(input.value) || input.value <= 0){
        input.value = 1
    }
    updateCartTotal()
}


function addToCartClicked(event){
    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
    var imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src
    var id = shopItem.dataset.itemId
    addItemToCart(title,price,imageSrc, id)
    updateCartTotal()
}

function addItemToCart(title, price, imageSrc, id){
    var cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    cartRow.dataset.itemId = id
    var cartItems = document.getElementsByClassName('cart-items')[0]
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for(var i = 0; i < cartItemNames.length; i++)
    {
        if(cartItemNames[i].innerText == title){
            alert('This item is already added to the cart')
            return /**exit the function */
        }
    }
    /**by using backticks we can add our html on several lines and use it in JS
     * to be fed into a variable that will read it like html.. then we can pass
     * in variables to the html using "${<parameter_name>}" and do awesome stuff with it
     */
    var cartRowContents = `
    <div class="cart-item cart-column">
        <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
        <span class="cart-item-title">${title}</span>
    </div>
    <span class="cart-price cart-column">${price}</span>
    <div class="cart-quantity cart-column">
        <input class="cart-quantity-input" type="number" value="1">
        <button class="btn btn-danger" type="button">REMOVE</button>
    </div>`
    cartRow.innerHTML = cartRowContents
    cartItems.appendChild(cartRow)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click',
    removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change',
    quantityChanged)
}

/**function format */
function updateCartTotal(){
    /**create var, grab elements in the document specified by the class name, 
     * only grab/set to first occurence*/
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0
    for(var i = 0; i < cartRows.length; i++){
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        /**you can grab the text from an element by using this .innerText method 
         * parseFloat will turn the string into a float
         * .replace straightforwardly replaces desired characters with something else
         * in this case $ with nothing
        */
        var price = parseFloat(priceElement.innerText.replace('$', '').replace(',',''))
        /**the quantityElement is an input with a number type value so we just grab the value */
        var quantity = quantityElement.value
        total = total + (price * quantity)
    }
    total = Math.round(total * 100) / 100/**allow us to round to nearest two decimal places */
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}