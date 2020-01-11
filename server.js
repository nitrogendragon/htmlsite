if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
console.log(stripeSecretKey)
const express = require('express')
const app = express()/**sets up our express server */

app.set('view engine', 'ejs')/**tells the app to use ejs to render our views */
app.use(express.static('public'))

app.listen(3000)