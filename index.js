const express = require('express');
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const PORT=process.env.PORT || 8081;
const { Client, Environment, ApiError } = require('square')

const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
});

const auth_token = process.env.AUTH_TOKEN


app.get('/get-catalog',async(req,res)=>{
    try {
        if(req.headers.authorization && req.headers.authorization.split(' ')[1] == auth_token){
            const response = await client.catalogApi.listCatalog();
            var sqObj = response.result.objects;
            var finObj = []
            for(var ind in sqObj){
                var obj = sqObj[ind]
                var image_id = obj.itemData.imageIds[0];
                const img_response = await client.catalogApi.retrieveCatalogObject(image_id,true,undefined,true);
                var imgObj = img_response.result.object;
                var image_url = imgObj.imageData.url;
                var currObj = {
                    'name' : obj.itemData.name,
                    'price' : obj.itemData.variations[0].priceMoney,
                    'description' : obj.itemData.descriptionHtml,
                    'image_url' : image_url
                }
                finObj.push(currObj)
            }
            res.status(200).send(finObj).end();
        }
        else res.status(401).send("Invalid Request").end();
    } 
    catch(error) {
        res.status(500).send(error.message).end();
    }
})

app.post('/payment-link',async(req,res)=>{
    try {
        if(req.headers.authorization && req.headers.authorization.split(' ')[1] == auth_token && req.body){
            var obj = req.body
            const response = await client.checkoutApi.createPaymentLink(obj);
            console.log(response.result);
            res.status(201).send("Payment Link Created").end();
        }
        else res.status(401).send("Invalid Request").end();
    } 
    catch(error) {
        res.status(500).send(error.message).end();
    }
})

app.all('*', async function(req, res, next){
    res.sendStatus(404);
    res.end();
 });

app.listen((''+PORT), function(){
    console.log("Port Connected....");
 });